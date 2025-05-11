import neo4j, { Driver, Session, Record } from 'neo4j-driver';

interface Neo4jRecord extends Record {
    get<K extends PropertyKey = PropertyKey>(key: K): any;
    get(n: number): any;
    toObject(): any;
}

class Neo4jService {
    private driver: Driver;

    constructor() {
        this.driver = neo4j.driver(
            'bolt://localhost:7687',
            neo4j.auth.basic('neo4j', 'password')
        );
    }

    private async runQuery<T>(query: string, params: any = {}): Promise<Neo4jRecord[]> {
        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            return result.records as Neo4jRecord[];
        } finally {
            await session.close();
        }
    }

    async initialize() {
        try {
            await this.runQuery(`
                CREATE CONSTRAINT IF NOT EXISTS FOR (g:Genome) REQUIRE g.genome IS UNIQUE;
            `);
            console.log('Neo4j Constraint wurde erfolgreich erstellt');
        } catch (error) {
            console.error('Fehler beim Initialisieren der Neo4j-Datenbank:', error);
            throw error;
        }
    }

    async createGenome(genome: string) {
        try {
            const result = await this.runQuery(`
                MERGE (g:Genome {genome: $genome})
                RETURN g
            `, { genome });
            return result[0].get('g').properties;
        } catch (error) {
            console.error('Fehler beim Erstellen des Genoms:', error);
            throw error;
        }
    }

    async createBattle(genome1: string, genome2: string, ratio: number) {
        try {
            // Stelle sicher, dass beide Genome existieren
            await this.createGenome(genome1);
            await this.createGenome(genome2);

            // Bestimme Gewinner und Verlierer
            const [winner, loser, winnerRatio] = ratio > 0.5
                ? [genome1, genome2, ratio]
                : [genome2, genome1, 1 - ratio];

            if (winnerRatio < 0.7) {
                return;
            }

            // Erstelle die Kampf-Beziehung vom Gewinner zum Verlierer
            const result = await this.runQuery(`
                MATCH (g1:Genome {genome: $winner}), (g2:Genome {genome: $loser})
                MERGE (g1)-[b:BATTLE {ratio: $winnerRatio}]->(g2)
                RETURN b
            `, { winner, loser, winnerRatio });
            return result[0].get('b').properties;
        } catch (error) {
            console.error('Fehler beim Erstellen der Kampf-Beziehung:', error);
            throw error;
        }
    }

    async getBattlesForGenome(genome: string) {
        try {
            const result = await this.runQuery(`
                MATCH (g:Genome {genome: $genome})-[b:BATTLE]->(opponent:Genome)
                RETURN opponent.genome as opponentGenome, b.ratio as ratio
                ORDER BY b.ratio DESC
            `, { genome });

            return result.map((record: Neo4jRecord) => ({
                opponentGenome: record.get('opponentGenome'),
                ratio: record.get('ratio')
            }));
        } catch (error) {
            console.error('Fehler beim Abrufen der Kämpfe:', error);
            throw error;
        }
    }

    async getTopBattles(limit: number = 10) {
        try {
            const result = await this.runQuery(`
                MATCH (g1:Genome)-[b:BATTLE]->(g2:Genome)
                RETURN g1.genome as genome1, g2.genome as genome2, b.ratio as ratio
                ORDER BY b.ratio DESC
                LIMIT $limit
            `, { limit });

            return result.map((record: Neo4jRecord) => ({
                genome1: record.get('genome1'),
                genome2: record.get('genome2'),
                ratio: record.get('ratio')
            }));
        } catch (error) {
            console.error('Fehler beim Abrufen der Top-Kämpfe:', error);
            throw error;
        }
    }

    async getGenomeStats(genome: string) {
        try {
            const result = await this.runQuery(`
                MATCH (g:Genome {genome: $genome})
                OPTIONAL MATCH (g)-[b:BATTLE]->(opponent:Genome)
                WITH g, 
                     COUNT(b) as totalBattles,
                     AVG(b.ratio) as avgRatio,
                     MAX(b.ratio) as maxRatio,
                     MIN(b.ratio) as minRatio
                RETURN totalBattles, avgRatio, maxRatio, minRatio
            `, { genome });

            return result[0].toObject();
        } catch (error) {
            console.error('Fehler beim Abrufen der Genom-Statistiken:', error);
            throw error;
        }
    }

    async close() {
        await this.driver.close();
    }
}

export const neo4jService = new Neo4jService(); 