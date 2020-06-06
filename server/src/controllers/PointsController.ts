import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

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
            image: 'image-fake',
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
    
        return response.json({sucess: true});
    }
}

export default PointsController;