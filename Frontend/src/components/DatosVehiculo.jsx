function DatosVehiculo({ vehiculo }) {
  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 shadow-lg">
      <h3 className="text-base font-semibold uppercase tracking-[0.15em] text-emerald-300">
        Vehiculo encontrado
      </h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p><span className="text-emerald-300/80">Placa:</span> {vehiculo.placa}</p>
        <p><span className="text-emerald-300/80">Marca:</span> {vehiculo.marca}</p>
        <p><span className="text-emerald-300/80">Modelo:</span> {vehiculo.modelo}</p>
        <p><span className="text-emerald-300/80">Anio:</span> {vehiculo.anio}</p>
        <p className="sm:col-span-2">
          <span className="text-emerald-300/80">Propietario:</span> {vehiculo.propietario || "No registrado"}
        </p>
      </div>
    </section>
  );
}

export default DatosVehiculo;
