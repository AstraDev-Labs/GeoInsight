import fs from 'fs';

const p = 'c:\\Users\\Tharu\\OneDrive\\Documents\\GeoInsight\\src\\app\\admin\\page.tsx';
let content = fs.readFileSync(p, 'utf-8');

// Replace dark mode utilities with NASA white theme styling
content = content.replace(/bg-background/g, 'bg-[#f4f4f4]');
content = content.replace(/text-foreground/g, 'text-[#222]');
content = content.replace(/bg-black\/50/g, 'bg-[#f9f9f9]');
content = content.replace(/bg-black\/40/g, 'bg-[#f4f4f4]');
content = content.replace(/bg-black\/20/g, 'bg-[#eaeaea]');
content = content.replace(/bg-black\/10/g, 'bg-[#f0f0f0]');
content = content.replace(/border-white\/10/g, 'border-[#e5e5e5]');
content = content.replace(/border-white\/5/g, 'border-[#e5e5e5]');
content = content.replace(/bg-white\/5/g, 'bg-[#f9f9f9]');
content = content.replace(/bg-white\/10/g, 'bg-[#f0f0f0]');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-[#e5e5e5]');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-[#f4f4f4]');
content = content.replace(/text-white\/90/g, 'text-[#222]');
content = content.replace(/text-white\/80/g, 'text-[#444]');
content = content.replace(/text-white\/70/g, 'text-[#555]');
content = content.replace(/text-white\/50/g, 'text-[#777]');
content = content.replace(/text-white/g, 'text-[#222]');
content = content.replace(/text-muted-foreground/g, 'text-[#666]');
content = content.replace(/glass-card/g, 'bg-white border border-[#e5e5e5] shadow-sm');
content = content.replace(/shadow-\[0_0_.*?\]/g, 'shadow-sm');
content = content.replace(/drop-shadow-\[.*?\]/g, '');
content = content.replace(/blur-\[100px\]/g, 'hidden');
content = content.replace(/blur-\[120px\]/g, 'hidden');
content = content.replace(/prose-invert/g, '');

// Re-adjust some buttons taking into consideration new white text
content = content.replace(/text-primary-foreground/g, 'text-white');
content = content.replace(/bg-emerald-500 text-white/g, 'bg-[#222] text-white'); // Live Archive button active state
content = content.replace(/bg-secondary text-primary-foreground/g, 'bg-[#222] text-white'); // Action Audit button active state
content = content.replace(/text-primary/g, 'text-[#006699]');
content = content.replace(/bg-primary\/10/g, 'bg-[#006699]\/10');
content = content.replace(/bg-primary/g, 'bg-[#006699]');
content = content.replace(/border-primary/g, 'border-[#006699]');

fs.writeFileSync(p, content, 'utf-8');
console.log('Admin page theme updated successfully.');
