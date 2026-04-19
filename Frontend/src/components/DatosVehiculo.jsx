function DatosVehiculo({ vehiculo }) {
  return (
    <div style={styles.card}>
      <h3>Vehículo encontrado</h3>
      <p><strong>Placa:</strong> {vehiculo.placa}</p>
      <p><strong>Marca:</strong> {vehiculo.marca}</p>
      <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
      <p><strong>Año:</strong> {vehiculo.anio}</p>
      <p><strong>Propietario:</strong> {vehiculo.propietario || "No registrado"}</p>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ecfdf5",
    border: "1px solid #10b981",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },
};

export default DatosVehiculo;