import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../src/utils/dbConnect';
import BattleResult, { IBattleResult } from '../../../src/models/BattleResult';



export async function GET() {
    await dbConnect();

    try {
        const results = await BattleResult.find({});
        return NextResponse.json({ success: true, data: results }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const results: IBattleResult[] = await req.json();
        const savedResults = await BattleResult.insertMany(results);
        console.log('Eingefügte Einträge:', savedResults.length);
        return NextResponse.json({ success: true, data: savedResults }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.warn('Fehler beim Einfügen:', errorMessage);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
