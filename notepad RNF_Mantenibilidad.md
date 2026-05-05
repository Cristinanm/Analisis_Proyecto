# RNF-05 Mantenibilidad

El sistema cumple con el requisito de mantenibilidad porque su estructura está organizada por módulos independientes. Cada funcionalidad principal del sistema se encuentra separada en archivos específicos, lo cual permite realizar cambios, correcciones o mejoras sin afectar directamente el funcionamiento general del sistema.

En el backend, las rutas se encuentran separadas por responsabilidad, por ejemplo:

- multa_router.py
- propietario_router.py
- routers_auth.py
- routers_reportes.py
- consulta_multas_router.py
- recibo_router.py

Esta organización facilita el mantenimiento, ya que si se necesita modificar el módulo de reportes, no es necesario alterar directamente el módulo de multas, propietarios o autenticación.
