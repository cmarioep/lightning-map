export function getNg(lat, lon, dataset) {

    const { meta, data } = dataset

    const latIndex = Math.floor(
        (lat - meta.lat_range[0]) / meta.lat_step
    )

    const lonIndex = Math.floor(
        (lon - meta.lon_range[0]) / meta.lon_step
    )

    if (
        latIndex < 0 ||
        lonIndex < 0 ||
        latIndex >= meta.shape[0] ||
        lonIndex >= meta.shape[1]
    ) {
        return null
    }

    return data[latIndex][lonIndex]
}