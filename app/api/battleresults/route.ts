import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../src/utils/dbConnect';
import BattleResult, { IBattleResult } from '../../../src/models/BattleResult';



export async function GET() {
    await dbConnect();

    try {
        const results = await BattleResult.find({});
        return NextResponse.json({ success: true, data: results }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const results: IBattleResult[] = await req.json();
        const savedResults = await BattleResult.insertMany(results);
        console.log('Eingefügte Einträge:', savedResults.length);
        return NextResponse.json({ success: true, data: savedResults }, { status: 201 });
    } catch (error: any) {
        console.warn('Fehler beim Einfügen:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
