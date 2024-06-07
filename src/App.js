import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Chart from "react-apexcharts";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
         "https://raw.githubusercontent.com/rajansudan39/rajansudan39/main/sample-data.json "
        );
        setData(result.data.data);
        setSelectedUser(result.data.data.AuthorWorklog.rows[0].name); // Default to the first user
      } catch (error) {
        setError("Error fetching the data");
        console.error("Error fetching the data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Stored Data:", data);
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data.AuthorWorklog || !data.AuthorWorklog.rows) {
    return <div>No data available</div>;
  }

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const aggregateDayWiseActivity = (dayWiseActivity) => {
    const aggregatedData = {};

    dayWiseActivity.forEach((day) => {
      day.items.children.forEach((item) => {
        const count = parseInt(item.count, 10); // Ensure the count is treated as a number
        if (aggregatedData[item.label]) {
          aggregatedData[item.label] += count;
        } else {
          aggregatedData[item.label] = count;
        }
      });
    });

    return aggregatedData;
  };

  const aggregateTotalActivities = (rows) => {
    const aggregatedData = {};

    rows.forEach((row) => {
      row.totalActivity.forEach((activity) => {
        const value = parseInt(activity.value, 10);
        if (aggregatedData[activity.name]) {
          aggregatedData[activity.name] += value;
        } else {
          aggregatedData[activity.name] = value;
        }
      });
    });

    return aggregatedData;
  };

  const overallAggregatedData = aggregateTotalActivities(data.AuthorWorklog.rows);
  const overallCategories = Object.keys(overallAggregatedData);
  const overallCounts = Object.values(overallAggregatedData);

  const overallBarChartData = {
    labels: overallCategories,
    datasets: [
      {
        label: "Total Activity Count",
        data: overallCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };

  const overallBarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Activities for All Users',
      },
    },
  };

  const selectedAuthor = data.AuthorWorklog.rows.find(
    (author) => author.name === selectedUser
  );

  if (!selectedAuthor) {
    return <div>No data available for the selected user</div>;
  }

  const aggregatedData = aggregateDayWiseActivity(selectedAuthor.dayWiseActivity);
  const categories = Object.keys(aggregatedData);
  const counts = Object.values(aggregatedData);

  // Data for pie chart
  const pieChartData = selectedAuthor.totalActivity.map((activity) => ({
    x: activity.name,
    y: parseInt(activity.value, 10),
  }));

  // Data for line chart
  const lineChartData = selectedAuthor.dayWiseActivity.map((day) => ({
    x: day.date,
    y: day.items.children.reduce((total, item) => total + parseInt(item.count, 10), 0),
  }));

  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{ marginTop: "20px" }}>
        Activity Tracker
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card style={{ marginBottom: "20px", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Activities for All Users
              </Typography>
              <Bar data={overallBarChartData} options={overallBarChartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        See activities by user
      </Typography>
      <FormControl fullWidth variant="outlined" style={{ marginBottom: "20px" }}>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
          id="user-select"
          value={selectedUser}
          label="Select User"
          onChange={handleUserChange}
        >
          {data.AuthorWorklog.rows.map((author) => (
            <MenuItem key={author.name} value={author.name}>
              {author.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card style={{ marginBottom: "20px", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedAuthor.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom style={{ marginBottom: "16px" }}>
                Total Activities
              </Typography>
              <Grid container spacing={3}>
                {selectedAuthor.totalActivity.map((activity) => (
                  <Grid item key={activity.name} xs={12} sm={6} md={4}>
                    <Card
                      style={{
                        backgroundColor:
                          data.AuthorWorklog.activityMeta.find(
                            (meta) => meta.label === activity.name
                          )?.fillColor || "#f5f5f5",
                        borderRadius: "12px",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" style={{ fontWeight: 600 , color: "white"}}>
                          {activity.name}
                        </Typography>
                        <Typography variant="h6" style={{ fontWeight: 700, color: "white" }}>
                          {activity.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card style={{ marginBottom: "20px", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedAuthor.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom style={{ marginBottom: "16px" }}>
                Total Activities Distribution
              </Typography>
              <Chart
                options={{
                  labels: pieChartData.map((data) => data.x),
                  responsive: [
                    {
                      breakpoint: 480,
                      options: {
                        chart: {
                          width: 200,
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                    },
                  ],
                }}
                series={pieChartData.map((data) => data.y)}
                type="pie"
                height={350}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card style={{ marginBottom: "20px", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedAuthor.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom style={{ marginBottom: "16px" }}>
                Total Activities Trend
              </Typography>
              <Chart
                options={{
                  chart: {
                    height: 350,
                    type: "line",
                    zoom: {
                      enabled: false,
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  stroke: {
                    curve: "smooth",
                  },
                  title: {
                    text: "Daily Activities Trend",
                    align: "left",
                  },
                  xaxis: {
                    type: "datetime",
                    categories: selectedAuthor.dayWiseActivity.map((day) => day.date),
                  },
                }}
                series={[
                  {
                    name: "Activity Count",
                    data: lineChartData.map((data) => data.y),
                  },
                ]}
                type="line"
                height={350}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card style={{ marginBottom: "20px", borderRadius: "12px" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedAuthor.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom style={{ marginBottom: "16px" }}>
                Aggregated Activities
              </Typography>
              <Bar
                data={{
                  labels: categories,
                  datasets: [
                    {
                      label: "Activity Count",
                      data: counts,
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Aggregated Activities',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
