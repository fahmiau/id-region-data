const fs = require('fs');

// Helper function to clean codes
const cleanCode = (code) => code.replace(/[.\s]/g, '');

// Helper function to convert array of objects to CSV
const toCsv = (data) => {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const value = '' + row[header];
            if (value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
};

// --- 1. Read Data ---
console.log('Reading JSON files...');
const provinces = JSON.parse(fs.readFileSync('provinces.json'));
const regencies = JSON.parse(fs.readFileSync('regencies.json'));
const districts = JSON.parse(fs.readFileSync('districts.json'));
const villages = JSON.parse(fs.readFileSync('villages.json'));

// --- 2. Process and Generate CSV files ---
console.log('Processing data and generating CSV files...');

// Create provinces.csv
const provinceData = provinces.map(p => ({
    name: cleanCode(p.code),
    label: p.name
}));
fs.writeFileSync('provinces.csv', toCsv(provinceData));
console.log('Successfully created provinces.csv');

// Create regencies.csv
const regencyData = regencies.map(r => ({
    province_code: cleanCode(r.province_code),
    name: cleanCode(r.code),
    label: r.name
}));
fs.writeFileSync('regencies.csv', toCsv(regencyData));
console.log('Successfully created regencies.csv');

// Create districts.csv
const districtData = districts.map(d => ({
    regency_code: cleanCode(d.regency_code),
    name: cleanCode(d.code),
    label: d.name
}));
fs.writeFileSync('districts.csv', toCsv(districtData));
console.log('Successfully created districts.csv');

// Create villages.csv
const villageData = villages.map(v => ({
    district_code: cleanCode(v.district_code),
    name: cleanCode(v.code),
    label: v.name
}));
fs.writeFileSync('villages.csv', toCsv(villageData));
console.log('Successfully created villages.csv');

// Create village CSVs per province
const villageDir = 'villages_by_province';
if (!fs.existsSync(villageDir)){
    fs.mkdirSync(villageDir, { recursive: true });
}

const regencyProvinceMap = new Map(regencies.map(r => [cleanCode(r.code), cleanCode(r.province_code)]));
const districtRegencyMap = new Map(districts.map(d => [cleanCode(d.code), cleanCode(d.regency_code)]));

const villagesByProvince = {};

villages.forEach(v => {
    const districtCode = cleanCode(v.district_code);
    const regencyCode = districtRegencyMap.get(districtCode);
    const provinceCode = regencyCode ? regencyProvinceMap.get(regencyCode) : null;

    if (provinceCode) {
        if (!villagesByProvince[provinceCode]) {
            villagesByProvince[provinceCode] = [];
        }
        villagesByProvince[provinceCode].push({
            district_code: districtCode,
            name: cleanCode(v.code),
            label: v.name
        });
    }
});

for (const provinceCode in villagesByProvince) {
    const csvData = toCsv(villagesByProvince[provinceCode]);
    const filePath = `${villageDir}/villages_${provinceCode}.csv`;
    fs.writeFileSync(filePath, csvData);
    console.log(`Successfully created ${filePath}`);
}

console.log('\nCSV generation complete.');
