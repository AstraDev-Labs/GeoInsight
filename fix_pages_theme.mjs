import fs from 'fs';

const files = [
    'c:\\Users\\Tharu\\OneDrive\\Documents\\GeoForesight\\src\\app\\privacy\\page.tsx',
    'c:\\Users\\Tharu\\OneDrive\\Documents\\GeoForesight\\src\\app\\support\\page.tsx'
];

files.forEach(p => {
    let content = fs.readFileSync(p, 'utf-8');

    // Make the body bg-white and text black
    content = content.replace(/bg-background text-foreground/g, 'bg-white text-black font-sans');

    // Add the wrapper for navbar
    content = content.replace(/<Navbar \/>/g, '<div className="bg-[#1a1a1a] shadow-md z-20 relative w-full">\n                <Navbar />\n            </div>');

    // Remove glowing items
    content = content.replace(/<div className="absolute top-\[-10%\].*?pointer-events-none" \/>/g, '');
    content = content.replace(/<div className="absolute bottom-\[-10%\].*?pointer-events-none" \/>/g, '');

    // Replace dark mode utilities with NASA white theme styling
    content = content.replace(/bg-black\/50/g, 'bg-[#f4f4f4]');
    content = content.replace(/bg-black\/40/g, 'bg-[#f4f4f4]');
    content = content.replace(/bg-black\/20/g, 'bg-[#eaeaea]');
    content = content.replace(/border-white\/10/g, 'border-[#e5e5e5]');
    content = content.replace(/border-white\/5/g, 'border-[#e5e5e5]');
    content = content.replace(/border-secondary\/20/g, 'border-[#e5e5e5]');
    content = content.replace(/bg-white\/5/g, 'bg-[#f9f9f9]');
    content = content.replace(/bg-white\/10/g, 'bg-[#f0f0f0]');
    content = content.replace(/hover:bg-white\/10/g, 'hover:bg-[#e5e5e5]');
    content = content.replace(/hover:bg-white\/5/g, 'hover:bg-[#f4f4f4]');

    // Support page specific
    content = content.replace(/glass-card/g, 'bg-[#f9f9f9] border border-[#e5e5e5] shadow-sm');
    content = content.replace(/shadow-\[0_0_.*?\]/g, 'shadow-sm');
    content = content.replace(/text-primary-foreground/g, 'text-white');
    content = content.replace(/text-primary/g, 'text-[#006699]');
    content = content.replace(/bg-primary\/10/g, 'bg-[#006699]\/10');
    content = content.replace(/bg-primary/g, 'bg-[#006699]');
    content = content.replace(/border-primary/g, 'border-[#006699]');
    content = content.replace(/text-secondary/g, 'text-[#222]');
    content = content.replace(/bg-secondary\/10/g, 'bg-[#f0f0f0]');
    content = content.replace(/text-white\/80/g, 'text-[#444] font-bold uppercase tracking-widest text-xs');
    content = content.replace(/text-white\/70/g, 'text-[#555]');
    content = content.replace(/text-white\/50/g, 'text-[#777]');
    content = content.replace(/text-muted-foreground/g, 'text-[#555]');

    // Because white overrides
    content = content.replace(/text-white/g, 'text-[#222]');
    content = content.replace(/bg-primary hover:bg-primary\/90 text-\[\#222\] font-bold text-lg shadow-sm hover:shadow-sm flex items-center justify-center gap-3 transition-all/g, 'bg-[#006699] hover:bg-[#004f7a] text-white font-bold text-lg shadow-sm flex items-center justify-center gap-3 transition-all');

    // Privacy specific
    content = content.replace(/prose-invert/g, '');
    content = content.replace(/prose-p:text-\[\#555\]/g, 'prose-p:text-[#444]');
    content = content.replace(/prose-strong:text-\[\#222\]/g, 'prose-strong:text-[#111]');
    content = content.replace(/prose-headings:text-foreground/g, 'prose-headings:text-[#222] prose-headings:font-serif');

    // Fix footers
    content = content.replace(/<footer className="relative z-10 border-t border-\[\#e5e5e5\] bg-\[\#f4f4f4\] backdrop-blur-md py-12 text-center text-\[\#555\] mt-auto">/g, '<footer className="border-t border-[#e5e5e5] bg-[#f9f9f9] py-12 text-center text-[#666] font-sans text-sm mt-auto">');
    content = content.replace(/Built with Next\.js, Framer Motion & AWS\./g, 'Data Integrity & Scientific Excellence.');

    fs.writeFileSync(p, content, 'utf-8');
});
console.log('Privacy and Support themes updated successfully.');

