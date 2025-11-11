#!/bin/bash
# Script para limpiar API Keys del historial de git

git filter-branch -f --tree-filter '
if [ -f CONFIGURAR_SENDGRID_SECRETS.md ]; then
  sed -i "s/SG\.HqczQR-UTMyxSGd0xxubZg\.ap4_Tx2h7DaNruVqRQbD-VwLfmo402gq9yR7ulEhwxE/TU_API_KEY_AQUI/g" CONFIGURAR_SENDGRID_SECRETS.md
fi
if [ -f PASOS_IMPLEMENTAR_SECRETS.md ]; then
  sed -i "s/SG\.HqczQR-UTMyxSGd0xxubZg\.ap4_Tx2h7DaNruVqRQbD-VwLfmo402gq9yR7ulEhwxE/TU_API_KEY_AQUI/g" PASOS_IMPLEMENTAR_SECRETS.md
fi
if [ -f SOLUCION_ERROR_SENDGRID_401.md ]; then
  sed -i "s/SG\.yfzei8sqT-ORfmT-eVxjMQ\.05JhGRGuhRJjZ_-v8GIe1zVAmeoqrFCS0k_emrFjl6M/TU_API_KEY_AQUI/g" SOLUCION_ERROR_SENDGRID_401.md
fi
' --prune-empty --tag-name-filter cat -- --all

