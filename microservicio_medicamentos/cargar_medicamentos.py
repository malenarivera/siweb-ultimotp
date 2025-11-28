"""
Script para cargar medicamentos desde un archivo CSV a la base de datos
"""
import asyncio
import csv
import os
from core.database import async_session, init_db
from models.medicamento import Medicamento

async def cargar_medicamentos_desde_csv(archivo_csv: str):
    
    # Leer el archivo CSV
    medicamentos_cargados = 0
    
    async with async_session() as session:
        with open(archivo_csv, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                medicamento = Medicamento(
                    laboratorio_titular=row.get('laboratorio_titular'),
                    nombre_comercial=row['nombre_comercial'],
                    nombre_generico=row['nombre_generico'],
                    concentracion=row['concentracion'],
                    forma_farmaceutica=row['forma_farmaceutica'],
                    presentacion=row['presentacion'],
                )
                session.add(medicamento)
                medicamentos_cargados += 1
                
                # Commit cada 50 registros para mejor performance
                if medicamentos_cargados % 50 == 0:
                    await session.commit()
            

if __name__ == "__main__":
    import sys
    archivo_csv = sys.argv[1]
    asyncio.run(cargar_medicamentos_desde_csv(archivo_csv))

