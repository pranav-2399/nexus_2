function toBase62(decimal){
    const keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hash = ""
    while (decimal > 0){
        hash = keys[decimal % 62] + hash;
        decimal = Math.floor(decimal / 62);
    }
    return hash;
}

export function createHashKey(){
    const num = Date.now()
    let hash = toBase62(num);
    return (hash.length == 7)?(hash):(createHashKey());
}

export function modulo3(base62String){
    let sum = 0;
    for (let i = 0; i < base62String.length; i++){
        sum += base62String.charCodeAt(i);
    }
    return (sum % 3 + 1).toString();
}

export function isValidURL(string){
    let url;
    try {
        url = new URL(string);
    } catch (_){
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:"

}