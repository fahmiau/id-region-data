const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const provinceData = require('./province-data.json');

const getRegencies = async (provinceCode) => {
    try {
        const response = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching regencies for province ${provinceCode}:`, error);
        return [];
    }
};

const getDistricts = async (regencyCode) => {
    try {
        const response = await fetch(`https://wilayah.id/api/districts/${regencyCode}.json`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching districts for regency ${regencyCode}:`, error);
        return [];
    }
};

const getVillages = async (districtCode) => {
    try {
        const response = await fetch(`https://wilayah.id/api/villages/${districtCode}.json`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching villages for district ${districtCode}:`, error);
        return [];
    }
};

const getAllData = async () => {
    // 1. Provinces
    console.log('Processing provinces...');
    const provinces = provinceData.data.map(p => ({
        code: p.code,
        name: p.name.toUpperCase()
    }));
    fs.writeFileSync('provinces.json', JSON.stringify(provinces, null, 2));
    console.log('Provinces data saved to provinces.json');

    // 2. Regencies
    console.log('Fetching all regencies...');
    const allRegencies = [];
    for (const province of provinces) {
        console.log(`- Fetching regencies for ${province.name}`);
        const regencies = await getRegencies(province.code);
        if (regencies) {
            regencies.forEach(regency => {
                allRegencies.push({
                    code: regency.code,
                    province_code: province.code,
                    name: regency.name.toUpperCase()
                });
            });
        }
    }
    fs.writeFileSync('regencies.json', JSON.stringify(allRegencies, null, 2));
    console.log('All regencies data has been saved to regencies.json');

    // 3. Districts
    console.log('Fetching all districts...');
    const allDistricts = [];
    for (const regency of allRegencies) {
        console.log(`- Fetching districts for ${regency.name}`);
        const districts = await getDistricts(regency.code);
        if (districts) {
            districts.forEach(district => {
                allDistricts.push({
                    code: district.code,
                    regency_code: regency.code,
                    name: district.name.toUpperCase()
                });
            });
        }
    }
    fs.writeFileSync('districts.json', JSON.stringify(allDistricts, null, 2));
    console.log('All districts data has been saved to districts.json');

    // 4. Villages
    console.log('Fetching all villages...');
    const allVillages = [];
    for (const district of allDistricts) {
        console.log(`- Fetching villages for ${district.name}`);
        const villages = await getVillages(district.code);
        if (villages) {
            villages.forEach(village => {
                allVillages.push({
                    code: village.code,
                    district_code: district.code,
                    name: village.name.toUpperCase()
                });
            });
        }
    }
    fs.writeFileSync('villages.json', JSON.stringify(allVillages, null, 2));
    console.log('All villages data has been saved to villages.json');

    console.log('\nAll data has been fetched and saved to separate files.');
};

getAllData();
