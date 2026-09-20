import { FC } from "react";
import { useDashboardAdminData } from './dashboardAdminData'; 
import CustomSpinner from "../../../../components/common/custom-spinner";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Col, Row } from "react-bootstrap";

const DashboardAdmin: FC = () => {
    const { data, loading, error } = useDashboardAdminData();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}>
                 <CustomSpinner size={30} color="#3c03cc" />                            
            </div>
        );
    }

    
    const planChartData = data.clients_per_plan.map((plan) => ({
        name: plan.plan_name,
        Clientes: plan.clients_count,
    }));

    const statusChartData = data.clients_per_contract_status.map((status) => ({
        name: status.contract_status_name,
        Clientes: status.clients_count,
    }));

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

            <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px", backgroundColor: "#f0f8ff" }}>
                <Typography variant="h5">
                    Total de Clientes: <strong>{data.total_clients}</strong>
                </Typography>
            </Paper>

            {/* Seção: Clientes por Plano */}
            <Typography variant="h5" gutterBottom>
                Clientes por Plano
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                {/* Tabela de Clientes por Plano */}
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Plano</TableCell>
                                    <TableCell align="right">Clientes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.clients_per_plan.map((plan) => (
                                    <TableRow key={plan.plan_name}>
                                        <TableCell>{plan.plan_name}</TableCell>
                                        <TableCell align="right">{plan.clients_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Gráfico de Clientes por Plano */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: "20px" }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={planChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Clientes" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Seção: Clientes por Status de Contrato */}
            <Typography variant="h5" gutterBottom>
                Clientes por Status de Contrato
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                {/* Tabela de Clientes por Status de Contrato */}
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Clientes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.clients_per_contract_status.map((status) => (
                                    <TableRow key={status.contract_status_name}>
                                        <TableCell>{status.contract_status_name}</TableCell>
                                        <TableCell align="right">{status.clients_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Gráfico de Clientes por Status de Contrato */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: "20px" }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Clientes" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default DashboardAdmin;