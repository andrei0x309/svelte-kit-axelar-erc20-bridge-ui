import { config } from './config'


const routes = {
    '/': 'Bridge',
    '/history': 'History',
    '/about': 'About',
} as Record<string, string>

if (config.isFaucetEnabled) {
    routes['/faucet'] = 'Faucet'
}

const finalRoutes = {...routes} as const

export { finalRoutes as routes }