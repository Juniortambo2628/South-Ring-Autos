import { toast as hotToast } from "react-hot-toast";

export function useToast() {
    return {
        toast: ({ title, description, variant }: { title?: string, description?: React.ReactNode, variant?: 'default' | 'destructive' }) => {
            const message = `${title ? title + (description ? '\n' : '') : ''}${description || ''}`;

            if (variant === 'destructive') {
                hotToast.error(message, {
                    style: {
                        borderRadius: '16px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '16px',
                        fontWeight: 'bold'
                    },
                });
            } else {
                hotToast.success(message, {
                    style: {
                        borderRadius: '16px',
                        background: '#333',
                        color: '#fff',
                        padding: '16px',
                        fontWeight: 'bold'
                    },
                });
            }
        }
    };
}
