import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

    async index (request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.pointid')
            .whereIn('points_items.itemid', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.json(points);

    }

    async show (request: Request, response: Response) {
        const {id} = request.params;

        const point = await knex('points').where('id', id).first();

        if (point == null) {
            return response.status(400).json({message: 'point not found'});
        }

        const items = await knex('items')
            .join('points_items', 'items.id', "=", "points_items.itemid")
            .where('points_items.pointid', id)
            .select('items.title');

        return response.status(200).json({point, items});
    }

    async create (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf, 
            items
        } = request.body;
    
        const trx = await knex.transaction();
    
        const points = await trx('points').insert({
            image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        });
    
        const pointItens = items.map((itemid: number) => {
            return {
                itemid,
                pointid: points[0]
            };
        });
    
        await trx('points_items').insert(pointItens);
        await trx.commit();
    
        return response.json({sucess: true});
    }
}

export default PointsController;