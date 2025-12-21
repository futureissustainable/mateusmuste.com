// Dynamic COBE loader - only loads when MAP.EXE is opened
// This saves ~50KB on initial page load

let cobePromise = null;
let createGlobe = null;

export async function loadCobe() {
    // Return cached instance if already loaded
    if (createGlobe) {
        return createGlobe;
    }

    // Return existing promise if loading in progress
    if (cobePromise) {
        return cobePromise;
    }

    // Start loading
    cobePromise = (async () => {
        const cdns = [
            'https://cdn.skypack.dev/cobe',
            'https://esm.sh/cobe',
            'https://unpkg.com/cobe?module'
        ];

        for (const cdn of cdns) {
            try {
                const module = await import(/* @vite-ignore */ cdn);
                createGlobe = module.default;
                return createGlobe;
            } catch (e) {
                console.warn(`COBE CDN failed: ${cdn}`);
            }
        }

        console.error('All COBE CDNs failed - globe feature unavailable');
        return null;
    })();

    return cobePromise;
}

export function getCreateGlobe() {
    return createGlobe;
}

export default loadCobe;
