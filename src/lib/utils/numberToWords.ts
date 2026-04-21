const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function convertGroup(n: number): string {
    let res = '';
    if (n >= 100) {
        const c = Math.floor(n / 100);
        if (c > 1) res += units[c] + ' cent';
        else res += 'cent';
        if (c > 1 && n % 100 === 0) res += 's';
        res += ' ';
        n %= 100;
    }
    if (n >= 20) {
        const d = Math.floor(n / 10);
        const u = n % 10;
        if (d === 7 || d === 9) {
            res += tens[d - 1] + (u === 1 ? ' et ' : '-') + teens[u];
        } else {
            res += tens[d] + (u === 1 ? ' et ' : (u > 0 ? '-' : '')) + units[u];
        }
    } else if (n >= 10) {
        res += teens[n - 10];
    } else if (n > 0) {
        res += units[n];
    }
    return res.trim();
}

export function numberToFrench(n: number): string {
    if (n === 0) return 'zéro';
    let res = '';
    
    if (n >= 1000000) {
        const m = Math.floor(n / 1000000);
        res += (m > 1 ? convertGroup(m) + ' millions ' : 'un million ');
        n %= 1000000;
    }
    
    if (n >= 1000) {
        const k = Math.floor(n / 1000);
        if (k > 1) res += convertGroup(k) + ' mille ';
        else res += 'mille ';
        n %= 1000;
    }
    
    if (n > 0) {
        res += convertGroup(n);
    }
    
    return res.trim().charAt(0).toUpperCase() + res.trim().slice(1);
}
