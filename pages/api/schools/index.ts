import { NextApiRequest, NextApiResponse } from 'next'

import School from '@/models/School'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        if (!user.isAdmin) {
            return res.status(403).json({error: 'not authorized'})
        }
        if (req.method === 'GET') {
            const schools = await School.aggregate([
                { $lookup: { 
                    from: 'polls', 
                    localField: '_id', 
                    foreignField: 'school_id', 
                    as: 'polls' } 
                },
                { $addFields: {
                    pollCount: {$size: "$polls"}}
                },
                { $project: {polls: 0}
                },
            ])
            return res.json({data: schools})
        }
        if (req.method === 'POST') {
            const {name, city } = JSON.parse(req.body)
            const newSchool = new School({name, city })
            console.log(`creating new School: ${newSchool}`)
            const out = await newSchool.save()
            return res.json({data: out})
        }
    }