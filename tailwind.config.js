/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', "class"],
    theme: {
    	extend: {
    		colors: {
    			dark: {
    				bg: '#1a1a1a',
    				surface: '#242424',
    				elevated: '#2d2d2d',
    				border: '#3a3a3a',
    				hover: '#353535'
    			},
    			primary: {
    				'50': '#eef2ff',
    				'100': '#e0e7ff',
    				'200': '#c7d2fe',
    				'300': '#a5b4fc',
    				'400': '#818cf8',
    				'500': '#6366f1',
    				'600': '#4f46e5',
    				'700': '#4338ca',
    				'800': '#3730a3',
    				'900': '#312e81',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			board: {
    				technology: '#6366f1',
    				videogames: '#10b981',
    				anime: '#ec4899',
    				music: '#f59e0b',
    				creative: '#8b5cf6',
    				misc: '#6b7280'
    			},
    			greentext: '#789922',
    			quotlink: '#d00',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'system-ui',
    				'sans-serif'
    			],
    			mono: [
    				'JetBrains Mono',
    				'Fira Code',
    				'monospace'
    			]
    		},
    		fontSize: {
    			xs: [
    				'0.75rem',
    				{
    					lineHeight: '1rem'
    				}
    			],
    			sm: [
    				'0.875rem',
    				{
    					lineHeight: '1.25rem'
    				}
    			],
    			base: [
    				'1rem',
    				{
    					lineHeight: '1.5rem'
    				}
    			],
    			lg: [
    				'1.125rem',
    				{
    					lineHeight: '1.75rem'
    				}
    			],
    			xl: [
    				'1.25rem',
    				{
    					lineHeight: '1.75rem'
    				}
    			],
    			'2xl': [
    				'1.5rem',
    				{
    					lineHeight: '2rem'
    				}
    			]
    		},
    		spacing: {
    			'1': '0.25rem',
    			'2': '0.5rem',
    			'3': '0.75rem',
    			'4': '1rem',
    			'5': '1.25rem',
    			'6': '1.5rem',
    			'8': '2rem',
    			'10': '2.5rem',
    			'12': '3rem',
    			'0.5': '0.125rem'
    		},
    		animation: {
    			'fade-in': 'fadeIn 0.3s ease-in-out',
    			'slide-in': 'slideIn 0.3s ease-out',
    			shimmer: 'shimmer 2s linear infinite',
    			'scale-up': 'scaleUp 0.2s ease-out'
    		},
    		keyframes: {
    			fadeIn: {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			},
    			slideIn: {
    				'0%': {
    					transform: 'translateY(-10px)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			},
    			shimmer: {
    				'0%': {
    					backgroundPosition: '-1000px 0'
    				},
    				'100%': {
    					backgroundPosition: '1000px 0'
    				}
    			},
    			scaleUp: {
    				'0%': {
    					transform: 'scale(0.95)'
    				},
    				'100%': {
    					transform: 'scale(1)'
    				}
    			}
    		},
    		backdropBlur: {
    			xs: '2px'
    		},
    		boxShadow: {
    			glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    			'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    			'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    			'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
}
