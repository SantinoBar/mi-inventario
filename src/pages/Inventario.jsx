import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button, Input, Select, Modal, Card } from '../components/common';
import { useInventario } from '../context/InventarioContext';

const Inventario = () => {
  // Obtener datos y funciones del contexto
  const {
    productos,
    servicios,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    agregarStock: agregarStockContext,
    agregarServicio,
    editarServicio,
    eliminarServicio
  } = useInventario();

  // Estados de modales - Productos
  const [modalAgregarProducto, setModalAgregarProducto] = useState(false);
  const [modalEditarProducto, setModalEditarProducto] = useState(false);
  const [modalAgregarStock, setModalAgregarStock] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estados de modales - Servicios
  const [modalAgregarServicio, setModalAgregarServicio] = useState(false);
  const [modalEditarServicio, setModalEditarServicio] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Modal de confirmación de eliminación
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [tipoEliminar, setTipoEliminar] = useState(''); // 'producto' o 'servicio'

  // Estados de formularios - Producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: 0,
    unidad: 'Unidad',
    stock: 0
  });

  // Estados de formularios - Servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    precio: 0
  });

  // Estado para agregar stock
  const [cantidadStock, setCantidadStock] = useState(0);

  // ========== FUNCIONES PRODUCTOS ==========

  const handleAgregarProducto = async () => {
    const result = await agregarProducto(nuevoProducto);
    if (result.success) {
      setModalAgregarProducto(false);
      setNuevoProducto({ nombre: '', precio: 0, unidad: 'Unidad', stock: 0 });
    } else {
      alert('Error al agregar producto: ' + result.error);
    }
  };

  const handleEditarProducto = async () => {
    const result = await editarProducto(productoSeleccionado.id, productoSeleccionado);
    if (result.success) {
      setModalEditarProducto(false);
      setProductoSeleccionado(null);
    } else {
      alert('Error al editar producto: ' + result.error);
    }
  };

  const handleAgregarStock = async () => {
    const result = await agregarStockContext(productoSeleccionado.id, cantidadStock);
    if (result.success) {
      setModalAgregarStock(false);
      setProductoSeleccionado(null);
      setCantidadStock(0);
    } else {
      alert('Error al agregar stock: ' + result.error);
    }
  };

  const abrirModalEditarProducto = (producto) => {
    setProductoSeleccionado({ ...producto });
    setModalEditarProducto(true);
  };

  const abrirModalAgregarStock = (producto) => {
    setProductoSeleccionado(producto);
    setModalAgregarStock(true);
  };

  // ========== FUNCIONES SERVICIOS ==========

  const handleAgregarServicio = async () => {
    const result = await agregarServicio(nuevoServicio);
    if (result.success) {
      setModalAgregarServicio(false);
      setNuevoServicio({ nombre: '', precio: 0 });
    } else {
      alert('Error al agregar servicio: ' + result.error);
    }
  };

  const handleEditarServicio = async () => {
    const result = await editarServicio(servicioSeleccionado.id, servicioSeleccionado);
    if (result.success) {
      setModalEditarServicio(false);
      setServicioSeleccionado(null);
    } else {
      alert('Error al editar servicio: ' + result.error);
    }
  };

  const abrirModalEditarServicio = (servicio) => {
    setServicioSeleccionado({ ...servicio });
    setModalEditarServicio(true);
  };

  // ========== FUNCIONES ELIMINAR ==========

  const abrirModalEliminar = (item, tipo) => {
    setItemAEliminar(item);
    setTipoEliminar(tipo);
    setModalConfirmarEliminar(true);
  };

  const confirmarEliminar = async () => {
    let result;
    if (tipoEliminar === 'producto') {
      result = await eliminarProducto(itemAEliminar.id);
    } else if (tipoEliminar === 'servicio') {
      result = await eliminarServicio(itemAEliminar.id);
    }

    if (result.success) {
      setModalConfirmarEliminar(false);
      setItemAEliminar(null);
      setTipoEliminar('');
    } else {
      alert('Error al eliminar: ' + result.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <p className="text-gray-600 mt-1">Gestiona tus productos y servicios</p>
      </div>

      {/* SECCIÓN PRODUCTOS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Productos</h2>
          <Button
            onClick={() => setModalAgregarProducto(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </Button>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((producto) => (
            <Card key={producto.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{producto.nombre}</h3>
                  <p className="text-2xl font-bold text-primary-700 mt-1">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  producto.unidad === 'Litro' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {producto.unidad}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Stock: <span className="font-semibold text-gray-800">{producto.stock}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => abrirModalEditarProducto(producto)}
                  variant="outline"
                  size="small"
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => abrirModalAgregarStock(producto)}
                  variant="secondary"
                  size="small"
                  className="flex-1"
                >
                  + Stock
                </Button>
                <Button
                  onClick={() => abrirModalEliminar(producto, 'producto')}
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

        {productos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay productos registrados
          </div>
        )}
      </div>

      {/* SECCIÓN SERVICIOS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Servicios</h2>
          <Button
            onClick={() => setModalAgregarServicio(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Servicio
          </Button>
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((servicio) => (
            <Card key={servicio.id} className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">{servicio.nombre}</h3>
                <p className="text-2xl font-bold text-primary-700 mt-1">
                  ${servicio.precio.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => abrirModalEditarServicio(servicio)}
                  variant="outline"
                  size="small"
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => abrirModalEliminar(servicio, 'servicio')}
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

        {servicios.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay servicios registrados
          </div>
        )}
      </div>

      {/* ========== MODALES PRODUCTOS ========== */}

      {/* Modal Agregar Producto */}
      <Modal
        isOpen={modalAgregarProducto}
        onClose={() => setModalAgregarProducto(false)}
        title="Agregar Producto"
        subtitle="Registra un nuevo producto en tu inventario"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Producto"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            placeholder="Ej: Detergente Premium"
            required
          />

          <Input
            type="number"
            label="Precio"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            required
          />

          <Select
            label="Unidad de Medida"
            value={nuevoProducto.unidad}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, unidad: e.target.value })}
            options={[
              { value: 'Unidad', label: 'Unidad' },
              { value: 'Litro', label: 'Litro' }
            ]}
            required
          />

          <Input
            type="number"
            label="Stock Inicial"
            value={nuevoProducto.stock}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setModalAgregarProducto(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarProducto}
              variant="primary"
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        isOpen={modalEditarProducto}
        onClose={() => setModalEditarProducto(false)}
        title="Editar Producto"
        subtitle="Modifica la información del producto"
      >
        {productoSeleccionado && (
          <div className="space-y-4">
            <Input
              label="Nombre del Producto"
              value={productoSeleccionado.nombre}
              onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })}
              required
            />

            <Input
              type="number"
              label="Precio"
              value={productoSeleccionado.precio}
              onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, precio: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />

            <Select
              label="Unidad de Medida"
              value={productoSeleccionado.unidad}
              onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, unidad: e.target.value })}
              options={[
                { value: 'Unidad', label: 'Unidad' },
                { value: 'Litro', label: 'Litro' }
              ]}
              required
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Stock actual</p>
              <p className="text-2xl font-bold text-gray-800">{productoSeleccionado.stock}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setModalEditarProducto(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditarProducto}
                variant="primary"
                className="flex-1"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Agregar Stock */}
      <Modal
        isOpen={modalAgregarStock}
        onClose={() => setModalAgregarStock(false)}
        title="Agregar Stock"
        subtitle={productoSeleccionado ? `Producto: ${productoSeleccionado.nombre}` : ''}
        size="small"
      >
        {productoSeleccionado && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Stock actual</p>
              <p className="text-2xl font-bold text-gray-800">{productoSeleccionado.stock}</p>
            </div>

            <Input
              type="number"
              label="Cantidad a Agregar"
              value={cantidadStock}
              onChange={(e) => setCantidadStock(parseInt(e.target.value) || 0)}
              min="1"
              required
            />

            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-700">Nuevo stock</p>
              <p className="text-2xl font-bold text-primary-900">
                {productoSeleccionado.stock + cantidadStock}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setModalAgregarStock(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAgregarStock}
                variant="primary"
                className="flex-1"
              >
                Agregar Stock
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========== MODALES SERVICIOS ========== */}

      {/* Modal Agregar Servicio */}
      <Modal
        isOpen={modalAgregarServicio}
        onClose={() => setModalAgregarServicio(false)}
        title="Agregar Servicio"
        subtitle="Registra un nuevo servicio"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Servicio"
            value={nuevoServicio.nombre}
            onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
            placeholder="Ej: Lavado completo"
            required
          />

          <Input
            type="number"
            label="Precio"
            value={nuevoServicio.precio}
            onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            required
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setModalAgregarServicio(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarServicio}
              variant="primary"
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Servicio */}
      <Modal
        isOpen={modalEditarServicio}
        onClose={() => setModalEditarServicio(false)}
        title="Editar Servicio"
        subtitle="Modifica la información del servicio"
      >
        {servicioSeleccionado && (
          <div className="space-y-4">
            <Input
              label="Nombre del Servicio"
              value={servicioSeleccionado.nombre}
              onChange={(e) => setServicioSeleccionado({ ...servicioSeleccionado, nombre: e.target.value })}
              required
            />

            <Input
              type="number"
              label="Precio"
              value={servicioSeleccionado.precio}
              onChange={(e) => setServicioSeleccionado({ ...servicioSeleccionado, precio: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setModalEditarServicio(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditarServicio}
                variant="primary"
                className="flex-1"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========== MODAL CONFIRMAR ELIMINAR ========== */}
      <Modal
        isOpen={modalConfirmarEliminar}
        onClose={() => setModalConfirmarEliminar(false)}
        title="Confirmar Eliminación"
        subtitle="Esta acción no se puede deshacer"
        size="small"
      >
        {itemAEliminar && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ¿Estás seguro de que deseas eliminar{' '}
                <span className="font-semibold">{itemAEliminar.nombre}</span>?
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

export default Inventario;