import less from 'less';
import fs from 'fs';

const themes = [
    { src: 'src/css/theme-default.less', dest: 'public/css/theme-default.css' },
    { src: 'src/css/theme-coastalblues.less', dest: 'public/css/theme-coastalblues.css' },
    { src: 'src/css/theme-vintage.less', dest: 'public/css/theme-vintage.css' },
    { src: 'src/css/theme-modern.less', dest: 'public/css/theme-modern.css' },
    { src: 'src/css/theme-starrynight.less', dest: 'public/css/theme-starrynight.css' },
    { src: 'src/css/theme-vibrant.less', dest: 'public/css/theme-vibrant.css' }
]

for (const theme of themes) {
    console.log(`Compiling ${theme.src} -> ${theme.dest}`)
    const result = await less.render(await fs.promises.readFile(theme.src, 'utf8'), {
        filename: theme.src,
        javascriptEnabled: true
    });
    await fs.promises.writeFile(theme.dest, result.css, 'utf8');
}