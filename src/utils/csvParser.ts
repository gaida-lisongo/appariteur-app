import ExcelJS from 'exceljs';

// Fonction pour parser un fichier CSV ou Excel
export async function parseCsvExcel(file: File): Promise<any[]> {
  console.log('Parsing file:', file);
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await file.arrayBuffer();
      
      // Créer un nouveau classeur Excel
      const workbook = new ExcelJS.Workbook();
      
      if (file.name.endsWith('.csv')) {
        // Si c'est un CSV, utiliser le lecteur de CSV
        const text = await file.text();

        console.log('CSV content:', text);

        // Séparer par des lignes
        const lines = text.split('\n');
        
        if (lines.length === 0) {
          resolve([]);
          return;
        }
        
        // Supposer que la première ligne contient les en-têtes
        const headers = lines[0].split(',').map(header => header.trim());
        console.log('CSV headers:', headers);
        const data: any[] = [];
        // Commencer à partir de la deuxième ligne (index 1)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Ignorer les lignes vides
          
          const values = lines[i].split(',');
          const row: any = {};
          
          headers.forEach((header, index) => {
            // Normaliser les noms d'en-têtes
            const normalizedKey = normalizeKey(header);
            // Assigner la valeur correspondante ou une chaîne vide si non définie
            row[normalizedKey] = index < values.length ? values[index].trim() : '';
          });
          
          data.push(row);
        }
        
        resolve(data);
      } else {
        // Pour les fichiers Excel (.xlsx, .xls)
        await workbook.xlsx.load(buffer);
        
        // Récupérer la première feuille
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          resolve([]);
          return;
        }
        
        const data: any[] = [];
        
        // Récupérer les en-têtes (première ligne)
        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers.push(cell.value?.toString() || `Column${colNumber}`);
        });
        
        // Parcourir les lignes (à partir de la deuxième ligne)
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row: any = {};
          
          // Parcourir les cellules de la ligne
          worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= headers.length) {
              // Normaliser le nom de la clé
              const normalizedKey = normalizeKey(headers[colNumber - 1]);
              // Obtenir la valeur de la cellule
              let value = '';
              
              if (cell.value !== null && cell.value !== undefined) {
                // Gestion des différents types de cellules Excel
                if (cell.value instanceof Date) {
                  value = formatDate(cell.value);
                } else if (typeof cell.value === 'object' && 'text' in cell.value) {
                  value = cell.value.text || '';
                } else {
                  value = cell.value.toString();
                }
              }
              
              row[normalizedKey] = value;
            }
          });
          
          // Ajouter seulement les lignes non vides (contenant au moins une valeur non vide)
          if (Object.values(row).some(val => val !== '')) {
            data.push(row);
          }
        }
        
        resolve(data);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      reject(error);
    }
  });
}

// Fonction pour normaliser les noms de clés
function normalizeKey(key: string): string {
  // Convertir la clé en chaîne si ce n'est pas déjà le cas
  const strKey = String(key);
  
  // Supprimer les caractères non alphanumériques et les espaces
  const cleanKey = strKey
    .replace(/[^\w\s]/gi, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '');     // Supprimer les espaces
  
  // Mettre en camelCase (première lettre minuscule)
  if (cleanKey.length > 0) {
    return cleanKey.charAt(0).toLowerCase() + cleanKey.slice(1);
  }
  
  return cleanKey;
}

// Fonction pour formater les dates
function formatDate(date: Date): string {
  try {
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    return date.toString();
  }
}