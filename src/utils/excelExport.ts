import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Promotion } from '@/types/api.types';

// Type pour les données d'étudiant (à adapter selon votre structure)
type EtudiantData = {
  _id: string;
  nom: string;
  prenom: string;
  matricule?: string;
  email?: string;
  telephone?: string;
  sexe: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  optId?: string;
  [key: string]: any; // Pour permettre l'accès dynamique aux propriétés
};

interface ExportOptions {
  title?: string;
  filename?: string;
  sheetName?: string;
  logoPath?: string;
}

export async function exportEtudiantsToExcel(
  etudiants: EtudiantData[],
  promotion: Promotion | null,
  anneeAcademique: string,
  options: ExportOptions = {}
) {
  const {
    title = 'Liste des étudiants',
    filename = 'liste-etudiants.xlsx',
    sheetName = 'Étudiants'
  } = options;

  // Créer un nouveau classeur Excel
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'INBTP App';
  workbook.lastModifiedBy = 'Système d\'Appariteur';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Ajouter une feuille
  const worksheet = workbook.addWorksheet(sheetName);

  // Ajouter des lignes d'en-tête avec le style approprié
  // En-tête 1: République
  const headerRow1 = worksheet.addRow(['République Démocratique du Congo']);
  headerRow1.height = 25;
  headerRow1.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A1:K1');

  // En-tête 2: Ministère
  const headerRow2 = worksheet.addRow(['Ministère de l\'enseignement Supérieur et Universitaire']);
  headerRow2.height = 22;
  headerRow2.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A2:K2');

  // En-tête 3: Institut
  const headerRow3 = worksheet.addRow(['Institut National du Bâtiment et des Travaux Publics']);
  headerRow3.height = 25;
  headerRow3.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A3:K3');

  // En-tête 4: INBTP/KINSHASA
  const headerRow4 = worksheet.addRow(['INBTP/KINSHASA']);
  headerRow4.height = 30;
  headerRow4.eachCell((cell) => {
    cell.font = { bold: true, size: 16 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A4:K4');

  // Ajouter un espace
  worksheet.addRow([]);

  // Ajouter le titre du document
  const titleRow = worksheet.addRow([title]);
  titleRow.height = 28;
  titleRow.eachCell((cell) => {
    cell.font = { bold: true, size: 16, underline: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A6:K6');

  // Ajouter un espace
  worksheet.addRow([]);

  // Ajouter les informations sur la promotion et l'année académique
  const promotionInfo = `Promotion: ${promotion?.niveau || 'Non définie'} ${promotion?.mention || ''} ${promotion?.orientation || ''}`;
  const promotionRow = worksheet.addRow([promotionInfo]);
  promotionRow.height = 22;
  promotionRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  worksheet.mergeCells('A8:K8');

  const anneeRow = worksheet.addRow([`Année académique: ${anneeAcademique}`]);
  anneeRow.height = 22;
  anneeRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  worksheet.mergeCells('A9:K9');

  // Statistiques
  const totalEtudiants = etudiants.length;
  const hommes = etudiants.filter(e => e.sexe === 'M' || e.sexe === 'masculin').length;
  const femmes = etudiants.filter(e => e.sexe === 'F' || e.sexe === 'féminin').length;

  const statsRow = worksheet.addRow([`Statistiques: ${totalEtudiants} étudiants (${hommes} hommes, ${femmes} femmes)`]);
  statsRow.height = 22;
  statsRow.eachCell((cell) => {
    cell.font = { italic: true, size: 11 };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  worksheet.mergeCells('A10:K10');

  // Ajouter un espace
  worksheet.addRow([]);

  // Configurer les colonnes pour le tableau de données
  worksheet.columns = [
    { key: 'index', width: 5 },
    { key: 'nom', width: 20 },
    { key: 'prenom', width: 20 },
    { key: 'matricule', width: 15 },
    { key: 'sexe', width: 8 },
    { key: 'dateNaissance', width: 15 },
    { key: 'lieuNaissance', width: 20 },
    { key: 'email', width: 25 },
    { key: 'telephone', width: 15 },
    { key: 'adresse', width: 25 },
    { key: 'optId', width: 15 }
  ];

  // Ajouter l'en-tête des données avec style
  const headerRow = worksheet.addRow([
    'N°', 'Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 
    'Lieu de naissance', 'Email', 'Téléphone', 'Adresse', 'ID Option'
  ]);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' } // Bleu
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' } // Blanc
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Ajouter les données des étudiants
  etudiants.forEach((etudiant, index) => {
    const rowData = [
      index + 1,
      etudiant.nom,
      etudiant.prenom,
      etudiant.matricule || '',
      etudiant.sexe === 'M' || etudiant.sexe === 'masculin' ? 'Masculin' : 'Féminin',
      formatDate(etudiant.dateNaissance),
      etudiant.lieuNaissance || '',
      etudiant.email || '',
      etudiant.telephone || '',
      etudiant.adresse || '',
      etudiant.optId || ''
    ];

    const row = worksheet.addRow(rowData);

    // Appliquer des styles aux cellules de données
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Aligner différemment selon le type de données
      if (typeof cell.value === 'number') {
        cell.alignment = { horizontal: 'center' };
      } else {
        cell.alignment = { horizontal: 'left' };
      }
    });

    // Centrer certaines colonnes spécifiques
    row.getCell(1).alignment = { horizontal: 'center' }; // N°
    row.getCell(5).alignment = { horizontal: 'center' }; // Sexe
    row.getCell(6).alignment = { horizontal: 'center' }; // Date
  });

  // Ajouter pied de page
  worksheet.addRow([]);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const footerRow = worksheet.addRow([`Document généré le ${currentDate}`]);
  footerRow.eachCell((cell) => {
    cell.font = { italic: true, size: 10 };
    cell.alignment = { horizontal: 'right' };
  });
  worksheet.mergeCells(`A${etudiants.length + 14}:K${etudiants.length + 14}`);

  // Convertir le classeur en buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Créer un Blob à partir du buffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Enregistrer le fichier
  saveAs(blob, filename);
}

// Ajouter cette fonction dans votre fichier excelExport.ts
export async function generateExcelTemplate(
  promotion: Promotion | null,
  anneeAcademique: string,
  options: ExportOptions = {}
) {
  const {
    filename = 'modele-import-etudiants.xlsx',
    sheetName = "Modèle d'importation"
  } = options;

  // Créer un nouveau classeur Excel
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'INBTP App';
  workbook.lastModifiedBy = 'Système d\'Appariteur';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Ajouter une feuille
  const worksheet = workbook.addWorksheet(sheetName);

  // En-tête 1: République
  const headerRow1 = worksheet.addRow(['République Démocratique du Congo']);
  headerRow1.height = 25;
  headerRow1.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A1:P1'); // Pour les 16 colonnes

  // En-tête 2: Ministère
  const headerRow2 = worksheet.addRow(['Ministère de l\'enseignement Supérieur et Universitaire']);
  headerRow2.height = 22;
  headerRow2.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A2:P2');

  // En-tête 3: Institut
  const headerRow3 = worksheet.addRow(['Institut National du Bâtiment et des Travaux Publics']);
  headerRow3.height = 25;
  headerRow3.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A3:P3');

  // En-tête 4: INBTP/KINSHASA
  const headerRow4 = worksheet.addRow(['INBTP/KINSHASA']);
  headerRow4.height = 30;
  headerRow4.eachCell((cell) => {
    cell.font = { bold: true, size: 16 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A4:P4');

  // Ajouter un espace
  worksheet.addRow([]);

  // Titre du modèle
  const titleRow = worksheet.addRow(['MODÈLE DE FICHIER POUR IMPORTATION DES ÉTUDIANTS']);
  titleRow.height = 28;
  titleRow.eachCell((cell) => {
    cell.font = { bold: true, size: 16, underline: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  worksheet.mergeCells('A6:P6');

  // Ajouter un espace
  worksheet.addRow([]);
  
  // Informations sur la promotion et l'année académique
  if (promotion) {
    const promotionInfo = `Promotion: ${promotion.niveau || 'Non définie'} ${promotion.mention || ''} ${promotion.orientation || ''}`;
    const promotionRow = worksheet.addRow([promotionInfo]);
    promotionRow.height = 22;
    promotionRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });
    worksheet.mergeCells('A8:P8');
  }

  const anneeRow = worksheet.addRow([`Année académique: ${anneeAcademique}`]);
  anneeRow.height = 22;
  anneeRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  worksheet.mergeCells('A9:P9');

  // Instructions
  const instructionRow = worksheet.addRow(['Instructions: Veuillez remplir ce modèle avec les données des étudiants et l\'importer via le formulaire d\'importation.']);
  instructionRow.height = 22;
  instructionRow.eachCell((cell) => {
    cell.font = { italic: true, size: 11, color: { argb: 'FF0000FF' } }; // Bleu
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });
  worksheet.mergeCells('A10:P10');

  // Ajouter un espace
  worksheet.addRow([]);
  
  // Définition des colonnes avec les entêtes spécifiés
  const headers = [
    'nom', 'postNom', 'preNom', 'sexe', 'dateNaissance', 'lieuNaissance', 
    'adresse', 'etudiantId', 'email', 'telephone', 'optId', 
    'section', 'option', 'pourcentage', 'promotionId', 'anneeId'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  
  // Appliquer des styles aux en-têtes
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' } // Bleu
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' } // Blanc
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Configurer les largeurs de colonnes
  worksheet.columns = [
    { header: 'nom', key: 'nom', width: 20 },
    { header: 'postNom', key: 'postNom', width: 20 },
    { header: 'preNom', key: 'preNom', width: 20 },
    { header: 'sexe', key: 'sexe', width: 10 },
    { header: 'dateNaissance', key: 'dateNaissance', width: 15 },
    { header: 'lieuNaissance', key: 'lieuNaissance', width: 20 },
    { header: 'adresse', key: 'adresse', width: 25 },
    { header: 'etudiantId', key: 'etudiantId', width: 15 },
    { header: 'email', key: 'email', width: 25 },
    { header: 'telephone', key: 'telephone', width: 15 },
    { header: 'optId', key: 'optId', width: 15 },
    { header: 'section', key: 'section', width: 20 },
    { header: 'option', key: 'option', width: 20 },
    { header: 'pourcentage', key: 'pourcentage', width: 12 },
    { header: 'promotionId', key: 'promotionId', width: 15 },
    { header: 'anneeId', key: 'anneeId', width: 15 },
  ];

  // Ajouter quelques lignes vides comme exemple
  for (let i = 0; i < 5; i++) {
    const row = worksheet.addRow([]);
    // Donner un style aux cellules de la ligne
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }

  // Ajouter des commentaires sur chaque colonne pour guider l'utilisateur
  worksheet.getCell('A12').note = 'Nom de famille de l\'étudiant (obligatoire)';
  worksheet.getCell('B12').note = 'Post-nom de l\'étudiant (obligatoire)';
  worksheet.getCell('C12').note = 'Prénom de l\'étudiant';
  worksheet.getCell('D12').note = 'Sexe: M ou F (obligatoire)';
  worksheet.getCell('E12').note = 'Date de naissance (Format: JJ/MM/AAAA)';
  worksheet.getCell('F12').note = 'Lieu de naissance';
  worksheet.getCell('G12').note = 'Adresse complète';
  worksheet.getCell('H12').note = 'Identifiant étudiant (matricule)';
  worksheet.getCell('I12').note = 'Adresse email';
  worksheet.getCell('J12').note = 'Numéro de téléphone';
  worksheet.getCell('K12').note = 'ID d\'option';
  worksheet.getCell('L12').note = 'Section scolaire';
  worksheet.getCell('M12').note = 'Option scolaire';
  worksheet.getCell('N12').note = 'Pourcentage obtenu (nombre entre 0 et 100)';
  worksheet.getCell('O12').note = promotion ? `ID de promotion (défaut: ${promotion._id})` : 'ID de promotion';
  worksheet.getCell('P12').note = 'ID de l\'année académique';
  
  // Pré-remplir les valeurs de promotionId et anneeId si disponibles
  if (promotion) {
    worksheet.getCell('O13').value = promotion._id;
    worksheet.getCell('O14').value = promotion._id;
    worksheet.getCell('O15').value = promotion._id;
    worksheet.getCell('O16').value = promotion._id;
    worksheet.getCell('O17').value = promotion._id;
  }
  
  // Ajouter des exemples pour guider l'utilisateur
  worksheet.addRow([
    'Ex. Mbala', 'Mubiala', 'Jonathan', 'M', '15/05/2000', 
    'Kinshasa', 'Avenue des Écoles 123', 'ET2024001', 'jonathan.mbala@example.com', 
    '+243123456789', 'OPT001', 'Sciences', 'Informatique', '75', 
    promotion?._id || 'PROM_ID', 'ANNEE_ID'
  ]).eachCell((cell) => {
    cell.font = { italic: true, color: { argb: '808080' } };
  });

  // Convertir le classeur en buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Créer un Blob à partir du buffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Enregistrer le fichier
  saveAs(blob, filename);
}