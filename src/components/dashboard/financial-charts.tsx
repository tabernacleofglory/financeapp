"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};


export function FinancialCharts({ data }: { data: any[] }) {
  const categoryTotals = data.reduce((acc: Record<string, number>, item) => {
    Object.keys(item).forEach(key => {
      if(key !== 'date' && key !== 'Attendance' && key !== 'Total Giving' && key !== 'Total Attendance') {
        acc[key] = (acc[key] || 0) + item[key];
      }
    });
    return acc;
  }, {});

  const barChartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  const pieChartData = barChartData;
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle>Giving Over Time</CardTitle>
          <CardDescription>A daily summary of contributions in the selected date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} />
              <YAxis tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="Offerings" stroke="hsl(var(--chart-1))" strokeWidth={2} activeDot={{ r: 8 }} dot={false}/>
              <Line type="monotone" dataKey="Tithes" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="365 Offerings" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="First Fruit Offerings" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="Salomon Offerings" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Giving by Category</CardTitle>
          <CardDescription>Total contributions by category for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(val) => formatCurrency(val)} />
              <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)'}}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="value" name="Amount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-12">
        <CardHeader>
          <CardTitle>Giving Distribution</CardTitle>
          <CardDescription>Percentage distribution of giving across categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
