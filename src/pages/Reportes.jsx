import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Download, Package, Wrench } from 'lucide-react';
import { Button, Card } from '../components/common';
import { useVentas } from '../context/VentasContext';
import { useGastos } from '../context/GastosContext';

const Reportes = () => {
  // Obtener datos de los contextos
  const { ventas, obtenerVentasPorPeriodo, obtenerTotalPorPeriodo } = useVentas();
  const { gastos, obtenerTotalPorPeriodo: obtenerGastosPorPeriodo, obtenerGastosPorCategoria } = useGastos();

  // Estado del período seleccionado
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  // Períodos disponibles
  const periodos = [
    { valor: 'dia', etiqueta: 'Día' },
    { valor: 'semana', etiqueta: 'Semana' },
    { valor: 'mes', etiqueta: 'Mes' },
    { valor: 'anual', etiqueta: 'Anual' }
  ];

  // Calcular fechas según período
  const obtenerFechasPeriodo = (periodo) => {
    let hoy = new Date();
    let fechaFin = new Date(hoy);
    let fechaInicio = new Date(hoy);

    switch (periodo) {
      case 'dia':
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        const diaSemana = hoy.getDay();
        const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        fechaInicio.setDate(hoy.getDate() - diasHastaLunes);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'anual':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        fechaFin = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        break;
    }

    return { fechaInicio, fechaFin };
  };

  // Calcular datos del período usando useMemo para optimizar
  const datos = useMemo(() => {
    const { fechaInicio, fechaFin } = obtenerFechasPeriodo(periodoSeleccionado);

    // Obtener ventas del período
    const ventasPeriodo = obtenerVentasPorPeriodo(
      fechaInicio.toISOString(),
      fechaFin.toISOString()
    );

    // Calcular total de ventas
    const totalVentas = ventasPeriodo.reduce((sum, v) => sum + parseFloat(v.total), 0);

    // Calcular total de gastos del período
    const totalGastos = obtenerGastosPorPeriodo(
      fechaInicio.toISOString().split('T')[0],
      fechaFin.toISOString().split('T')[0]
    );

    // Calcular promedio de venta
    const promedioVenta = ventasPeriodo.length > 0 ? totalVentas / ventasPeriodo.length : 0;

    // Obtener gastos por categoría
    const gastosCategoria = obtenerGastosPorCategoria();
    const gastos_desglose = Object.entries(gastosCategoria).map(([categoria, monto]) => ({
      categoria,
      monto
    }));

    return {
      ventas: totalVentas,
      gastos: totalGastos,
      promedioVenta,
      cantidadVentas: ventasPeriodo.length,
      gastos_desglose,
      // Top productos se calculará después cuando tengamos ventas_items
      topProductos: []
    };
  }, [periodoSeleccionado, ventas, gastos, obtenerVentasPorPeriodo, obtenerGastosPorPeriodo, obtenerGastosPorCategoria]);

  const gananciaReal = datos.ventas - datos.gastos;
  const porcentajeGanancia = datos.ventas > 0 ? ((gananciaReal / datos.ventas) * 100).toFixed(1) : 0;

  // Función para exportar a PDF (placeholder)
  const exportarPDF = () => {
    // Aquí iría la lógica real de exportación a PDF
    console.log('Exportando reporte a PDF...');
    alert('Función de exportación a PDF en desarrollo');
  };

  return (
    <div className="space-y-6">
      {/* Header con períodos y exportar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis y métricas del negocio</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Selector de período */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {periodos.map(periodo => (
              <button
                key={periodo.valor}
                onClick={() => setPeriodoSeleccionado(periodo.valor)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodoSeleccionado === periodo.valor
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {periodo.etiqueta}
              </button>
            ))}
          </div>

          {/* Botón exportar */}
          <Button
            onClick={exportarPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* SECCIÓN 1: Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${datos.ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Gastos */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${datos.gastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Ganancia Real */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Real</p>
              <p className={`text-3xl font-bold mt-2 ${gananciaReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${gananciaReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-1 ${gananciaReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {porcentajeGanancia}% de margen
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              gananciaReal >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${gananciaReal >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </Card>

        {/* Promedio de Venta */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Promedio Venta</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${datos.promedioVenta.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* SECCIÓN 2: Gráfico de Líneas - Temporalmente deshabilitado */}
      {/* Gráfico estará disponible cuando haya más datos acumulados */}

      {/* SECCIÓN 3 y 4: Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos/Servicios */}
        <Card title="Productos y Servicios Más Vendidos" className="p-6">
          <div className="space-y-3 mt-4">
            {datos.topProductos.length > 0 ? (
              datos.topProductos.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">{producto.cantidad} unidades</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary-700">
                    ${producto.monto.toLocaleString('es-MX')}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay datos disponibles para este período</p>
                <p className="text-sm text-gray-500 mt-1">Registra ventas para ver estadísticas</p>
              </div>
            )}
          </div>
        </Card>

        {/* Desglose de Gastos */}
        <Card title="Desglose de Gastos" className="p-6">
          <div className="space-y-3 mt-4">
            {datos.gastos_desglose.length > 0 ? (
              <>
                {datos.gastos_desglose.map((gasto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="font-medium text-gray-800">{gasto.categoria}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <p className="font-semibold text-gray-800">Total</p>
                  <p className="font-bold text-red-600">
                    ${datos.gastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay gastos registrados para este período</p>
                <p className="text-sm text-gray-500 mt-1">Registra gastos para ver estadísticas</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reportes;