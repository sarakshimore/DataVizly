import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer
} from "recharts";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [pendingSortCol, setPendingSortCol] = useState(null);
  const [pendingSortOrder, setPendingSortOrder] = useState("asc");
  const [chartType, setChartType] = useState("bar");
  const [pendingChartConfig, setPendingChartConfig] = useState({ categorical: null, numeric: null });
  const [numericColumns, setNumericColumns] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Smart dynamic Y-axis scale
  const getDynamicYAxisProps = (values) => {
    if (!values?.length) return { domain: [0, "dataMax + 1"], ticks: [0, 1] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(range)) - 1) || 1;
    const ticks = [];
    for (let val = 0; val <= max + step; val += step) ticks.push(val);
    return { domain: [0, max + step], ticks };
  };

  // Fetch datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/datasets");
        setDatasets(res.data);
        if (res.data.length && !selectedDataset) setSelectedDataset(res.data[0]);
      } catch {
        toast.error("Failed to load datasets");
      } finally {
        setLoading(false);
      }
    };
    token ? fetchDatasets() : navigate("/login");
  }, [token, navigate]);

  // Fetch data and detect column types
  useEffect(() => {
    if (!selectedDataset) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/datasets/${selectedDataset.id}/view`, {
          params: {
            page,
            limit: 10,
            sort_column: sortColumn || undefined,
            sort_order: sortOrder || undefined,
            search: searchTerm || ""
          },
        });
        const { data, columns: cols, total } = res.data;
        setTableData(data || []);
        setColumns(cols || []);
        setTotalPages(Math.ceil((total || 0) / 10));

        const numCols = cols.filter(c => c.unique_values.every(v => !isNaN(parseFloat(v)))).map(c => c.name);
        const catCols = cols.filter(c => !c.unique_values.every(v => !isNaN(parseFloat(v)))).map(c => c.name);
        setNumericColumns(numCols);
        setCategoricalColumns(catCols);
      } catch (e) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDataset, page, sortColumn, sortOrder, searchTerm]);

  // Aggregated chart data (group numeric by category)
  const fetchChartDataManually = async (xAxis, yAxis) => {
    if (!selectedDataset) return;
    try {
      const res = await axiosInstance.get(`/datasets/${selectedDataset.id}/view`);
      const df = res.data.data;
      const grouped = {};

      df.forEach((row) => {
        const cat = String(row[xAxis]);
        const val = parseFloat(row[yAxis]) || 0;
        grouped[cat] = (grouped[cat] || 0) + val;
      });

      const transformed = Object.entries(grouped).map(([key, val]) => ({
        name: key,
        value: val
      }));

      setChartData(transformed);
    } catch (err) {
      toast.error("Chart generation failed.");
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handlePageChange = (newPage) => (newPage >= 1 && newPage <= totalPages) && setPage(newPage);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {loading && <div className="text-center">Loading...</div>}

        {/* Dataset Selector */}
        <Card className="mb-6 border-border">
          <CardHeader><CardTitle>Select Dataset</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedDataset?.id || ""} onValueChange={(v) => setSelectedDataset(datasets.find((d) => d.id === v))}>
              <SelectTrigger><SelectValue placeholder="Choose dataset" /></SelectTrigger>
              <SelectContent>
                {datasets.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Sorting */}
        <Card className="mb-6 border-border">
          <CardHeader><CardTitle>Table Sorting</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="pb-2">Search</Label>
                <Input placeholder="Search..." value={searchTerm} onChange={handleSearch} />
              </div>
              <div className="w-48">
                <Label className="pb-2">Sort Column</Label>
                <Select value={pendingSortCol || ""} onValueChange={setPendingSortCol}>
                  <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                  <SelectContent>
                    {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="pb-2">Sort By</Label>
                <Select value={pendingSortOrder} onValueChange={setPendingSortOrder}>
                  <SelectTrigger><SelectValue placeholder="Order" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setSortColumn(pendingSortCol); setSortOrder(pendingSortOrder); }} disabled={!pendingSortCol} className="bg-primary text-primary-foreground hover:bg-primary/90">Confirm Sort</Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {tableData.length > 0 && (
          <Card className="mb-6 border-border">
            <CardHeader><CardTitle>Data Table</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => (
                      <TableHead key={col.name} className="cursor-pointer hover:bg-muted">
                        <div className="flex justify-between items-center">
                          {col.name}
                          {sortColumn === col.name && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map(c => (
                        <TableCell key={`${c.name}-${i}`}>{row[c.name]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4 items-center">
                <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Configuration */}
        <Card className="mb-6 border-border">
          <CardHeader><CardTitle>Chart Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <Label className="pb-2">Chart Type</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger><SelectValue placeholder="Chart Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Axis selectors */}
              <div className="w-48">
                <Label className="pb-2">Categorical Column</Label>
                <Select value={pendingChartConfig.categorical || ""} onValueChange={(v) => setPendingChartConfig(p => ({ ...p, categorical: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Label" /></SelectTrigger>
                  <SelectContent>
                    {categoricalColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="pb-2">Numeric Column</Label>
                <Select value={pendingChartConfig.numeric || ""} onValueChange={(v) => setPendingChartConfig(p => ({ ...p, numeric: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Value" /></SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => fetchChartDataManually(pendingChartConfig.categorical, pendingChartConfig.numeric)} disabled={!pendingChartConfig.numeric || !pendingChartConfig.categorical} className="bg-primary text-primary-foreground hover:bg-primary/90">Generate Chart</Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {chartData.length > 0 && (
          <Card className="border-border">
            <CardHeader><CardTitle>Visualizations</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                {chartType === "bar" && (
                  <BarChart data={chartData} barSize={25} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis {...getDynamicYAxisProps(chartData.map(d => d.value))} tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
                {chartType === "line" && (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis {...getDynamicYAxisProps(chartData.map(d => d.value))} tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                )}
                {chartType === "pie" && (
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130}
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}>
                      {chartData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      <LabelList dataKey="value" position="inside" style={{ fill: "#fff", fontSize: 12, fontWeight: 500 }} />
                    </Pie>
                    <Tooltip formatter={(v, n, o) => [`${v.toLocaleString()} (${(o.payload.percent * 100).toFixed(1)}%)`, n]} />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
