const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'src/components/shop/SubscriptionModal.tsx',
    'src/app/admin/feedbacks/page.tsx',
    'src/app/admin/profile/page.tsx',
    'src/app/admin/missions/page.tsx',
    'src/app/(user)/settings/page.tsx',
    'src/app/(user)/shop/page.tsx',
    'src/app/(user)/missions/page.tsx',
    'src/app/(user)/goals/page.tsx'
];

function patchAlerts() {
    filesToPatch.forEach(relPath => {
        const fullPath = path.join(__dirname, relPath);
        if (!fs.existsSync(fullPath)) return;
        
        let content = fs.readFileSync(fullPath, 'utf8');

        if (content.includes('alert(')) {
            // Add import if not present
            if (!content.includes("from 'react-hot-toast'") && !content.includes('from "react-hot-toast"')) {
                // Find last import
                const lastImportIdx = content.lastIndexOf('import ');
                const endOfLastImport = content.indexOf('\n', lastImportIdx);
                content = content.slice(0, endOfLastImport + 1) + 
                          "import toast from 'react-hot-toast';\n" + 
                          content.slice(endOfLastImport + 1);
            }

            // Replace alert( with toast.success or error
            // Simple heuristic mapping
            content = content.replace(/alert\((['"`].*?['"`])\)/g, (match, message) => {
                const msgLower = message.toLowerCase();
                if (msgLower.includes('erro') || msgLower.includes('falha') || msgLower.includes('não')) {
                    return `toast.error(${message}, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } })`;
                }
                return `toast.success(${message}, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } })`;
            });

            // Handle alert(res.message || 'Erro...') 
            content = content.replace(/alert\((.*?\|\|.*?)\)/g, (match, expr) => {
                if (expr.toLowerCase().includes('erro') || expr.toLowerCase().includes('não')) {
                    return `toast.error(${expr}, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } })`;
                }
                return `toast(${expr}, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } })`;
            });
            
            // Handle alert(error...)
            content = content.replace(/alert\((.*?(?:error|err).*?)\)/gi, (match, expr) => {
                return `toast.error(${expr}, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } })`;
            });

            fs.writeFileSync(fullPath, content, 'utf8');
        }
    });

    // Patch layout
    const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
        let layoutContent = fs.readFileSync(layoutPath, 'utf8');
        if (!layoutContent.includes('Toaster')) {
            const userProviderIdx = layoutContent.indexOf('import { UserProvider }');
            layoutContent = layoutContent.slice(0, userProviderIdx) + 
                            "import { Toaster } from 'react-hot-toast';\n" + 
                            layoutContent.slice(userProviderIdx);
            
            const bodyIdx = layoutContent.indexOf('<body');
            const endOfBodyTag = layoutContent.indexOf('>', bodyIdx);
            layoutContent = layoutContent.slice(0, endOfBodyTag + 1) + 
                            "\n        <Toaster position=\"top-right\" toastOptions={{ className: 'custom-toast' }} />" + 
                            layoutContent.slice(endOfBodyTag + 1);
            fs.writeFileSync(layoutPath, layoutContent, 'utf8');
        }
    }
}

patchAlerts();
console.log('Patch finalizado!');
