/**
 * Car Logos Helper
 * Utility functions for working with car logos
 */

let carLogosCache = null;

/**
 * Load car logos data
 */
async function loadCarLogos() {
    if (carLogosCache) {
        return carLogosCache;
    }
    
    try {
        const response = await fetch('../api/car-logos.php?action=list');
        const data = await response.json();
        if (data.success) {
            carLogosCache = {};
            data.logos.forEach(logo => {
                carLogosCache[logo.slug.toLowerCase()] = logo;
                carLogosCache[logo.name.toLowerCase()] = logo;
            });
            return carLogosCache;
        }
    } catch (error) {
        console.error('Error loading car logos:', error);
    }
    return {};
}

/**
 * Get logo URL for a vehicle make
 * @param {string} make - Vehicle make name
 * @param {string} size - Logo size: 'thumb', 'optimized', or 'original'
 * @returns {Promise<string>} Logo URL
 */
async function getLogoUrl(make, size = 'thumb') {
    if (!make) return null;
    
    const logos = await loadCarLogos();
    const makeLower = make.toLowerCase().trim();
    
    // Try exact match first
    let logo = logos[makeLower];
    
    // Try partial match
    if (!logo) {
        for (const key in logos) {
            if (key.includes(makeLower) || makeLower.includes(key)) {
                logo = logos[key];
                break;
            }
        }
    }
    
    if (!logo || !logo.image) return null;
    
    // Use local path if available, otherwise use remote
    const localPath = logo.image[`local${size.charAt(0).toUpperCase() + size.slice(1)}`];
    if (localPath) {
        return `../car-logos-dataset-master/logos/${localPath.replace('./', '')}`;
    }
    
    return logo.image[size] || logo.image.thumb || null;
}

/**
 * Get logo data for a vehicle make
 * @param {string} make - Vehicle make name
 * @returns {Promise<object|null>} Logo data object
 */
async function getLogoData(make) {
    if (!make) return null;
    
    const logos = await loadCarLogos();
    const makeLower = make.toLowerCase().trim();
    
    let logo = logos[makeLower];
    
    if (!logo) {
        for (const key in logos) {
            if (key.includes(makeLower) || makeLower.includes(key)) {
                logo = logos[key];
                break;
            }
        }
    }
    
    return logo || null;
}

/**
 * Create logo image element
 * @param {string} make - Vehicle make name
 * @param {string} size - Logo size
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @returns {Promise<HTMLElement>} Image element
 */
async function createLogoImage(make, size = 'thumb', alt = '', className = '') {
    const img = document.createElement('img');
    const logoUrl = await getLogoUrl(make, size);
    
    if (logoUrl) {
        img.src = logoUrl;
        img.alt = alt || make || 'Car logo';
        if (className) img.className = className;
        img.onerror = function() {
            this.style.display = 'none';
        };
    } else {
        img.style.display = 'none';
    }
    
    return img;
}

