import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  // Estado para el nombre del producto
  const [productName, setProductName] = useState("");

  // Estados para los inputs principales
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [filamentCost, setCostFilament] = useState(0);
  const [realprice, setrealprice] = useState(0);
  const [pieces, setpieces] = useState(0);
  const [unidPrice, setunidPrice] = useState(0);

  // Estado para los extras
  const [extras, setExtras] = useState([]);

  // NUEVO: Estado para saber si estamos editando una cotización existente
  const [editingId, setEditingId] = useState(null);

  // Estado para las cotizaciones guardadas
  const [savedQuotes, setSavedQuotes] = useState(() => {
    const saved = localStorage.getItem("cotizaciones");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cotizaciones", JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const handleAddExtra = () => {
    setExtras([
      ...extras,
      { id: crypto.randomUUID(), name: "", price: 0, quantity: 1 },
    ]);
  };

  const handleUpdateExtra = (id, field, value) => {
    setExtras(
      extras.map((extra) =>
        extra.id === id ? { ...extra, [field]: value } : extra,
      ),
    );
  };

  const handleRemoveExtra = (id) => {
    setExtras(extras.filter((extra) => extra.id !== id));
  };

  // 1. Calcular el tiempo total en horas
  const totalTimeInHours = Number(hours) + Number(minutes) / 60;

  // 2. Determinar los costos por hora dinámicos
  let costElectricityPerHour = 0;
  let costMaintenancePerHour = 0;
  let costWifiPerHour = 0;

  if (totalTimeInHours > 0 && totalTimeInHours <= 3) {
    costElectricityPerHour = 3;
    costMaintenancePerHour = 8;
    costWifiPerHour = 2;
  } else if (totalTimeInHours > 3 && totalTimeInHours < 6) {
    costElectricityPerHour = 2;
    costMaintenancePerHour = 6;
    costWifiPerHour = 1.5;
  } else if (totalTimeInHours >= 6) {
    costElectricityPerHour = 1;
    costMaintenancePerHour = 5;
    costWifiPerHour = 1;
  }

  const totalDynamicCostPerHour =
    costElectricityPerHour + costMaintenancePerHour + costWifiPerHour;

  // 3. Cálculos de costos finales
  const machineCost = totalTimeInHours * totalDynamicCostPerHour;
  const materialCostAdjusted = Number(filamentCost) * 1.25;

  const totalExtras = extras.reduce(
    (sum, extra) => sum + Number(extra.price) * Number(extra.quantity),
    0,
  );

  const baseCost = machineCost + materialCostAdjusted + totalExtras;
  const priceTier1 = baseCost * 1.75;
  const priceTier2 = baseCost * 2;
  const revenue = Number(realprice) - baseCost;

  const piecesCount = Number(pieces);
  const unidCost = piecesCount > 0 ? baseCost / piecesCount : 0;
  const unidRevenue = Number(unidPrice) - unidCost;

  // --- Funciones de Control del Formulario ---

  // Función para limpiar todos los inputs (útil tras guardar o cancelar edición)
  const resetForm = () => {
    setProductName("");
    setHours(0);
    setMinutes(0);
    setCostFilament(0);
    setrealprice(0);
    setpieces(0);
    setunidPrice(0);
    setExtras([]);
    setEditingId(null);
  };

  const handleSaveQuote = () => {
    if (!productName.trim()) {
      alert("Por favor, ingresa un nombre para el producto antes de guardar.");
      return;
    }

    // Estructura completa de la cotización (se añaden extras, realprice y unidPrice)
    const quoteData = {
      id: editingId ? editingId : crypto.randomUUID(), // Si editamos, usamos el mismo ID
      date: new Date().toLocaleDateString(),
      productName,
      details: {
        hours,
        minutes,
        filamentCost,
        pieces,
        realprice,
        unidPrice,
        extras,
      },
      results: {
        baseCost,
        priceTier1,
        priceTier2,
        unidCost,
        revenue,
        unidRevenue,
      },
    };

    if (editingId) {
      // ACTUALIZAR cotización existente
      const updatedQuotes = savedQuotes.map((q) =>
        q.id === editingId ? quoteData : q,
      );
      setSavedQuotes(updatedQuotes);
    } else {
      // CREAR nueva cotización
      setSavedQuotes([quoteData, ...savedQuotes]);
    }

    resetForm();
  };

  // NUEVO: Cargar los datos de la tarjeta a los inputs de la calculadora
  const handleEditQuote = (quote) => {
    setProductName(quote.productName);
    setHours(quote.details.hours);
    setMinutes(quote.details.minutes);
    setCostFilament(quote.details.filamentCost);
    setpieces(quote.details.pieces);
    setrealprice(quote.details.realprice || 0);
    setunidPrice(quote.details.unidPrice || 0);
    setExtras(quote.details.extras || []);

    setEditingId(quote.id);

    // Hace scroll suave hacia arriba para ver la calculadora
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuote = (idToRemove) => {
    const filteredQuotes = savedQuotes.filter(
      (quote) => quote.id !== idToRemove,
    );
    setSavedQuotes(filteredQuotes);

    // Si borramos la cotización que estamos editando actualmente, limpiamos el form
    if (editingId === idToRemove) {
      resetForm();
    }
  };

  return (
    <div className="app-container">
      <main className="calculator">
        <div className="calculator__data">
          <input
            type="text"
            placeholder="Producto"
            className="product__title"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <div className="calculator__cost">
            <button className="btn btn--primary" onClick={handleAddExtra}>
              +
            </button>

            <div className="calculator__group">
              <label className="calculator__label" htmlFor="hours">
                Horas
              </label>
              <input
                className="calculator__input"
                type="number"
                id="hours"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div className="calculator__group">
              <label className="calculator__label" htmlFor="minutes">
                Minutos
              </label>
              <input
                className="calculator__input"
                type="number"
                id="minutes"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>

            <div className="calculator__group">
              <label className="calculator__label" htmlFor="filament-cost">
                Material
              </label>
              <input
                className="calculator__input"
                type="number"
                id="filament-cost"
                min="0"
                step="0.01"
                value={filamentCost}
                onChange={(e) => setCostFilament(e.target.value)}
              />
            </div>
          </div>
          {extras.length > 0 && (
            <div className="calculator__extas">
              <div></div>
              <label className="calculator__label">Nombre</label>
              <label className="calculator__label">Precio ($)</label>
              <label className="calculator__label">Cantidad</label>
            </div>
          )}
          {extras.map((extra) => (
            <div key={extra.id} className="calculator__extas">
              <button
                className="btn btn--danger"
                onClick={() => handleRemoveExtra(extra.id)}
              >
                X
              </button>
              <div className="calculator__group">
                <input
                  type="text"
                  className="calculator__input"
                  placeholder="Ej. Imán"
                  value={extra.name}
                  onChange={(e) =>
                    handleUpdateExtra(extra.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="calculator__group">
                <input
                  type="number"
                  className="calculator__input"
                  min="0"
                  step="0.01"
                  value={extra.price}
                  onChange={(e) =>
                    handleUpdateExtra(extra.id, "price", e.target.value)
                  }
                />
              </div>
              <div className="calculator__group">
                <input
                  type="number"
                  className="calculator__input"
                  min="1"
                  value={extra.quantity}
                  onChange={(e) =>
                    handleUpdateExtra(extra.id, "quantity", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="calculator__results">
          <div className="result_form">
            <div className="result">
              <span className="result__label">Costo Base</span>
              <span className="result__value">${baseCost.toFixed(2)}</span>
            </div>
            <div className="result ">
              <span className="result__label">Precio (x1.75)</span>
              <span className="result__value">${priceTier1.toFixed(2)}</span>
            </div>
            <div className="result ">
              <span className="result__label">Precio (x2)</span>
              <span className="result__value">${priceTier2.toFixed(2)}</span>
            </div>
          </div>
          <div className="result_form">
            <div className="result ">
              <label htmlFor="real-price" className="result__label">
                Precio Real
              </label>
              <input
                className="result__value"
                type="number"
                id="real-price"
                min="0"
                step="0.01"
                value={realprice}
                onChange={(e) => setrealprice(e.target.value)}
              />
            </div>
            <div className="result ">
              <span className="result__label">Ganancia</span>
              <span className="result__value">${revenue.toFixed(2)}</span>
            </div>
          </div>

          <div className="result_form">
            <div className="result ">
              <label htmlFor="pieces-of" className="result__label">
                Piezas
              </label>
              <input
                className="result__value"
                type="number"
                id="pieces-of"
                min="0"
                value={pieces}
                onChange={(e) => setpieces(e.target.value)}
              />
            </div>
            <div className="result ">
              <span className="result__label">Costo Unidad</span>
              <span className="result__value">${unidCost.toFixed(2)}</span>
            </div>
            <div className="result ">
              <label htmlFor="unid-price" className="result__label">
                Precio Unidad
              </label>
              <input
                className="result__value"
                type="number"
                id="unid-price"
                min="0"
                value={unidPrice}
                onChange={(e) => setunidPrice(e.target.value)}
              />
            </div>
            <div className="result ">
              <span className="result__label">Ganancia Unidad</span>
              <span className="result__value">${unidRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Contenedor de botones de acción modificado */}
          <div className="action-buttons-container">
            {editingId && (
              <button className="save__btn cancel__btn" onClick={resetForm}>
                CANCELAR
              </button>
            )}
            <button
              className="save__btn"
              onClick={handleSaveQuote}
              style={{ backgroundColor: editingId ? "#0056b3" : "green" }}
            >
              {editingId ? "ACTUALIZAR" : "GUARDAR"}
            </button>
          </div>
        </div>
      </main>

      {/* --- SECCIÓN DE COTIZACIONES GUARDADAS --- */}
      {savedQuotes.length > 0 && (
        <section className="saved-quotes-container">
          <h2 className="saved-quotes-title">Cotizaciones Guardadas</h2>
          <div className="saved-quotes-grid">
            {savedQuotes.map((quote) => (
              <div key={quote.id} className="quote-card">
                <div className="quote-header">
                  <h3>{quote.productName}</h3>
                  <span className="quote-date">{quote.date}</span>
                </div>
                <div className="quote-body">
                  <p>
                    <strong>Costo Base:</strong> $
                    {quote.results.baseCost.toFixed(2)}
                  </p>
                  <p>
                    <strong>Precio x1.75:</strong> $
                    {quote.results.priceTier1.toFixed(2)}
                  </p>
                  <p>
                    <strong>Costo x Unidad:</strong> $
                    {quote.results.unidCost.toFixed(2)} ({quote.details.pieces}{" "}
                    pz)
                  </p>
                </div>
                <div className="quote-actions">
                  <button
                    className="btn btn--full btn--edit"
                    onClick={() => handleEditQuote(quote)}
                  >
                    EDITAR
                  </button>
                  <button
                    className="btn btn--danger btn--full"
                    onClick={() => handleDeleteQuote(quote.id)}
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
