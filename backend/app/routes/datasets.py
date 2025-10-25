# backend/app/routes/datasets.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from ..core.security import get_current_user
from ..core.supabase_client import supabase
import pandas as pd
from io import BytesIO
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.get("/")
async def get_datasets(current_user: dict = Depends(get_current_user)):
    logger.debug(f"Fetching datasets for user: {current_user['id']}")
    try:
        datasets = supabase.table('datasets').select('id, user_id, name, file_path').eq('user_id', current_user["id"]).execute()
        logger.debug(f"Datasets fetched: {len(datasets.data)}")
        return datasets.data
    except Exception as e:
        logger.error(f"Error fetching datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch datasets: {str(e)}")

@router.get("/{id}/view")
async def get_view(
    id: str,
    page: int = 1,
    limit: int = 10,
    sort_column: str = None,
    sort_order: str = "asc",
    filters: str = "{}",
    search: str = "",
    current_user: dict = Depends(get_current_user)
):
    logger.debug(f"Fetching view for dataset {id}, page {page}, limit {limit}, sort {sort_column} {sort_order}, filters {filters}, search {search}")
    dataset = supabase.table('datasets').select('file_path').eq('id', id).eq('user_id', current_user["id"]).execute()
    if not dataset.data:
        logger.error(f"Dataset {id} not found for user {current_user['id']}")
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        file_path = dataset.data[0]['file_path']
        logger.debug(f"Downloading file from uploaded_datasets: {file_path}")
        file_response = supabase.storage.from_('uploaded_datasets').download(file_path)
        if not file_response:
            logger.error(f"File not found in storage: {file_path}")
            raise HTTPException(status_code=404, detail="File not found in storage")
        
        # Parse file
        if file_path.lower().endswith('.csv'):
            df = pd.read_csv(BytesIO(file_response))
        else:
            df = pd.read_excel(BytesIO(file_response))
        logger.debug(f"File parsed, columns: {list(df.columns)}, rows: {len(df)}")
        
        # Get column metadata
        columns_metadata = [
            {"name": col, "unique_values": [str(val) for val in df[col].dropna().unique()[:50]]}  # Limit to 50 for performance
            for col in df.columns
        ]
        
        # Apply search
        if search:
            df = df[df.apply(lambda row: row.astype(str).str.contains(search, case=False, na=False).any(), axis=1)]
            logger.debug(f"After search '{search}', rows: {len(df)}")
        
        # Apply filters
        if filters:
            filter_dict = json.loads(filters)
            for key, value in filter_dict.items():
                if key in df.columns:
                    df = df[df[key].astype(str) == str(value)]
            logger.debug(f"After filters {filters}, rows: {len(df)}")
        
        # Apply sorting
        if sort_column and sort_column in df.columns:
            df = df.sort_values(by=sort_column, ascending=(sort_order.lower() == "asc"))
            logger.debug(f"Sorted by {sort_column} {sort_order}")
        
        # Paginate
        total = len(df)
        paginated = df.iloc[(page-1)*limit:page*limit].to_dict('records')
        logger.debug(f"Returning {len(paginated)} rows, total: {total}, columns: {len(columns_metadata)}")
        return {"data": paginated, "total": total, "columns": columns_metadata}
    except Exception as e:
        logger.error(f"View error for dataset {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")

@router.get("/{id}/charts")
async def get_charts(
    id: str,
    chart_type: str = "bar",
    group_by: str = None,
    current_user: dict = Depends(get_current_user)
):
    logger.debug(f"Fetching chart for dataset {id}, type {chart_type}, group_by {group_by}")
    dataset = supabase.table('datasets').select('file_path').eq('id', id).eq('user_id', current_user["id"]).execute()
    if not dataset.data:
        logger.error(f"Dataset {id} not found for user {current_user['id']}")
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        file_path = dataset.data[0]['file_path']
        file_response = supabase.storage.from_('uploaded_datasets').download(file_path)
        if not file_response:
            logger.error(f"File not found in storage: {file_path}")
            raise HTTPException(status_code=404, detail="File not found in storage")
        
        if file_path.lower().endswith('.csv'):
            df = pd.read_csv(BytesIO(file_response))
        else:
            df = pd.read_excel(BytesIO(file_response))
        logger.debug(f"File parsed for chart, columns: {list(df.columns)}, rows: {len(df)}")
        
        if not group_by or group_by not in df.columns:
            default_column = df.columns[0] if df.columns.any() else None
            if not default_column:
                raise HTTPException(status_code=400, detail="No columns available for grouping")
            group_by = default_column
            logger.debug(f"No group_by specified, using default: {group_by}")
        
        if chart_type in ["bar", "line"]:
            chart_data = df.groupby(group_by).size().reset_index(name='value').to_dict('records')
        elif chart_type == "pie":
            chart_data = df.groupby(group_by).size().reset_index(name='value')
            chart_data = [
                {"name": row[group_by], "value": row['value']}
                for row in chart_data.to_dict('records')
            ]
        else:
            logger.error(f"Unsupported chart type: {chart_type}")
            raise HTTPException(status_code=400, detail="Unsupported chart type")
        
        logger.debug(f"Chart data: {len(chart_data)} groups")
        return chart_data
    except Exception as e:
        logger.error(f"Chart error for dataset {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load chart data: {str(e)}")

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    logger.debug(f"Upload request from user: {current_user['id']}")
    try:
        if not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="File must be .xlsx, .xls, or .csv")
        content = await file.read()
        file_size = len(content)
        if file_size > 1 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 1MB limit")
        storage_list = supabase.storage.from_('uploaded_datasets').list(f"{current_user['id']}/")
        current_size = sum(item.get('metadata', {}).get('size', 0) for item in storage_list)
        if current_size + file_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Storage limit of 50MB exceeded")
        file_path = f"{current_user['id']}/{file.filename}"
        supabase.storage.from_('uploaded_datasets').upload(file_path, content)
        dataset = {
            "user_id": current_user["id"],
            "name": file.filename,
            "file_path": file_path
        }
        res = supabase.table('datasets').insert(dataset).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to save dataset")
        logger.debug(f"Uploaded dataset {res.data[0]['id']}: {file_path}")
        return JSONResponse(content={"id": res.data[0]['id'], "message": "Upload successful"})
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")