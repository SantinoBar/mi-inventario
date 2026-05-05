import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, TrendingDown } from 'lucide-react';
import { Button, Input, Select, Modal, Card, TextArea } from '../components/common';
import { useGastos } from '../context/GastosContext';

const Gastos = () => {
  // Obtener datos y funciones del contexto
  const {
    gastos,
    loading,
    agregarGasto,
    editarGasto,
    eliminarGasto
  } = useGastos();

  // Categorías disponibles con colores
  const categorias = [
    { valor: 'Gas', label: 'Gas', color: 'bg-orange-100 text-orange-700' },
    { valor: 'Agua', label: 'Agua', color: 'bg-blue-100 text-blue-700' },
    { valor: 'Electricidad', label: 'Electricidad', color: 'bg-yellow-100 text-yellow-700' },
    { valor: 'Teléfono', label: 'Teléfono', color: 'bg-green-100 text-green-700' },
    { valor: 'Sueldos', label: 'Sueldos', color: 'bg-purple-100 text-purple-700' },
    { valor: 'Reparaciones', label: 'Reparaciones', color: 'bg-red-100 text-red-700' },
    { valor: 'Productos', label: 'Productos', color: 'bg-cyan-100 text-cyan-700' },
    { valor: 'Otros', label: 'Otros', color: 'bg-gray-100 text-gray-700' }
  ];

  // Filtro por categoría
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  // Estados de modales
  const [modalRegistrarGasto, setModalRegistrarGasto] = useState(false);
  const [modalEditarGasto, setModalEditarGasto] = useState(false);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);

  // Estado de formulario
  const [nuevoGasto, setNuevoGasto] = useState({
    categoria: 'Gas',
    descripcion: '',
    monto: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    notas: ''
  });

  // Filtrar gastos según categoría
  const gastosFiltrados = gastos.filter(gasto => 
    filtroCategoria === 'Todos' || gasto.categoria === filtroCategoria
  );

  // Calcular métricas
  const calcularTotalMes = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    
    return gastos
      .filter(g => {
        const fechaGasto = new Date(g.fecha_inicio);
        return fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === anioActual;
      })
      .reduce((sum, g) => sum + parseFloat(g.monto), 0);
  };

  const calcularPromedio = () => {
    if (gastos.length === 0) return 0;
    const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    return total / gastos.length;
  };

  const totalMes = calcularTotalMes();
  const promedioGasto = calcularPromedio();

  // ========== FUNCIONES ==========

  const handleRegistrarGasto = async () => {
    const gasto = {
      categoria: nuevoGasto.categoria,
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      fecha_inicio: nuevoGasto.fechaInicio,
      fecha_fin: nuevoGasto.fechaFin,
      notas: nuevoGasto.notas
    };
    
    const result = await agregarGasto(gasto);
    if (result.success) {
      setModalRegistrarGasto(false);
      setNuevoGasto({ 
        categoria: 'Gas', 
        descripcion: '', 
        monto: 0, 
        fechaInicio: new Date().toISOString().split('T')[0], 
        fechaFin: new Date().toISOString().split('T')[0],
        notas: '' 
      });
    } else {
      alert('Error al registrar gasto: ' + result.error);
    }
  };

  const handleEditarGasto = async () => {
    const gastoActualizado = {
      categoria: gastoSeleccionado.categoria,
      descripcion: gastoSeleccionado.descripcion,
      monto: gastoSeleccionado.monto,
      fecha_inicio: gastoSeleccionado.fecha_inicio,
      fecha_fin: gastoSeleccionado.fecha_fin,
      notas: gastoSeleccionado.notas
    };
    
    const result = await editarGasto(gastoSeleccionado.id, gastoActualizado);
    if (result.success) {
      setModalEditarGasto(false);
      setGastoSeleccionado(null);
    } else {
      alert('Error al editar gasto: ' + result.error);
    }
  };

  const abrirModalEditarGasto = (gasto) => {
    setGastoSeleccionado({ ...gasto });
    setModalEditarGasto(true);
  };

  const abrirModalEliminar = (gasto) => {
    setGastoSeleccionado(gasto);
    setModalConfirmarEliminar(true);
  };

  const confirmarEliminar = async () => {
    const result = await eliminarGasto(gastoSeleccionado.id);
    if (result.success) {
      setModalConfirmarEliminar(false);
      setGastoSeleccionado(null);
    } else {
      alert('Error al eliminar gasto: ' + result.error);
    }
  };

  // Obtener color de categoría
  const obtenerColorCategoria = (categoria) => {
    const cat = categorias.find(c => c.valor === categoria);
    return cat ? cat.color : 'bg-gray-100 text-gray-700';
  };

  // Truncar notas
  const truncarNotas = (texto, maxLength = 80) => {
    if (!texto) return 'Sin notas';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Formatear período
  const formatearPeriodo = (fechaInicio, fechaFin) => {
    if (fechaInicio === fechaFin) {
      return formatearFecha(fechaInicio);
    }
    return `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gastos</h1>
          <p className="text-gray-600 mt-1">Registra y controla los gastos del negocio</p>
        </div>
        <Button
          onClick={() => setModalRegistrarGasto(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar Gasto
        </Button>
      </div>

      {/* Resumen - Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total del Mes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastos del Mes</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ${totalMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Gasto Promedio */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gasto Promedio</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${promedioGasto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFiltroCategoria('Todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filtroCategoria === 'Todos'
              ? 'bg-primary-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({gastos.length})
        </button>
        {categorias.map(cat => {
          const cantidad = gastos.filter(g => g.categoria === cat.valor).length;
          return (
            <button
              key={cat.valor}
              onClick={() => setFiltroCategoria(cat.valor)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filtroCategoria === cat.valor
                  ? cat.color + ' font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cantidad})
            </button>
          );
        })}
      </div>

      {/* Grid de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gastosFiltrados.map((gasto) => (
          <Card key={gasto.id} className="p-4">
            {/* Header con categoría y período */}
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${obtenerColorCategoria(gasto.categoria)}`}>
                {gasto.categoria}
              </span>
              <span className="text-xs text-gray-500">{formatearPeriodo(gasto.fecha_inicio, gasto.fecha_fin)}</span>
            </div>

            {/* Descripción y monto */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-800 mb-1">{gasto.descripcion}</h3>
              <p className="text-2xl font-bold text-red-600">
                ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Notas */}
            {gasto.notas && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  {truncarNotas(gasto.notas)}
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={() => abrirModalEditarGasto(gasto)}
                variant="outline"
                size="small"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                onClick={() => abrirModalEliminar(gasto)}
                variant="danger"
                size="small"
                className="px-3"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensaje cuando no hay gastos */}
      {gastosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No hay gastos registrados
            {filtroCategoria !== 'Todos' && ` en la categoría ${filtroCategoria}`}
          </p>
        </div>
      )}

      {/* ========== MODALES ========== */}

      {/* Modal Registrar Gasto */}
      <Modal
        isOpen={modalRegistrarGasto}
        onClose={() => setModalRegistrarGasto(false)}
        title="Registrar Gasto"
        subtitle="Registra un nuevo gasto del negocio"
      >
        <div className="space-y-4">
          <Select
            label="Categoría"
            value={nuevoGasto.categoria}
            onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })}
            options={categorias.map(c => ({ value: c.valor, label: c.label }))}
            required
          />

          <Input
            label="Descripción/Concepto"
            value={nuevoGasto.descripcion}
            onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
            placeholder="Ej: Recarga de cilindro de gas"
          />

          <Input
            type="number"
            label="Monto"
            value={nuevoGasto.monto}
            onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Fecha Inicio del Período"
              value={nuevoGasto.fechaInicio}
              onChange={(e) => setNuevoGasto({ ...nuevoGasto, fechaInicio: e.target.value })}
              required
            />

            <Input
              type="date"
              label="Fecha Fin del Período"
              value={nuevoGasto.fechaFin}
              onChange={(e) => setNuevoGasto({ ...nuevoGasto, fechaFin: e.target.value })}
              required
            />
          </div>

          <TextArea
            label="Notas"
            value={nuevoGasto.notas}
            onChange={(e) => setNuevoGasto({ ...nuevoGasto, notas: e.target.value })}
            placeholder="Información adicional..."
            rows={3}
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setModalRegistrarGasto(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarGasto}
              variant="primary"
              className="flex-1"
              disabled={!nuevoGasto.categoria || !nuevoGasto.monto || !nuevoGasto.fechaInicio || !nuevoGasto.fechaFin}
            >
              Registrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Gasto */}
      <Modal
        isOpen={modalEditarGasto}
        onClose={() => setModalEditarGasto(false)}
        title="Editar Gasto"
        subtitle="Modifica la información del gasto"
      >
        {gastoSeleccionado && (
          <div className="space-y-4">
            <Select
              label="Categoría"
              value={gastoSeleccionado.categoria}
              onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, categoria: e.target.value })}
              options={categorias.map(c => ({ value: c.valor, label: c.label }))}
              required
            />

            <Input
              label="Descripción/Concepto"
              value={gastoSeleccionado.descripcion}
              onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, descripcion: e.target.value })}
            />

            <Input
              type="number"
              label="Monto"
              value={gastoSeleccionado.monto}
              onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, monto: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha Inicio del Período"
                value={gastoSeleccionado.fecha_inicio}
                onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, fecha_inicio: e.target.value })}
                required
              />

              <Input
                type="date"
                label="Fecha Fin del Período"
                value={gastoSeleccionado.fecha_fin}
                onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, fecha_fin: e.target.value })}
                required
              />
            </div>

            <TextArea
              label="Notas"
              value={gastoSeleccionado.notas}
              onChange={(e) => setGastoSeleccionado({ ...gastoSeleccionado, notas: e.target.value })}
              rows={3}
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setModalEditarGasto(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditarGasto}
                variant="primary"
                className="flex-1"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal
        isOpen={modalConfirmarEliminar}
        onClose={() => setModalConfirmarEliminar(false)}
        title="Confirmar Eliminación"
        subtitle="Esta acción no se puede deshacer"
        size="small"
      >
        {gastoSeleccionado && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ¿Estás seguro de que deseas eliminar el gasto de{' '}
                <span className="font-semibold">{gastoSeleccionado.descripcion}</span> por{' '}
                <span className="font-semibold">${gastoSeleccionado.monto.toFixed(2)}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setModalConfirmarEliminar(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                variant="danger"
                className="flex-1"
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Gastos;