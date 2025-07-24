import { randomUUID } from "node:crypto";
import { Database } from "./middlewares/database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            switch (req.headers['content-type']) {
                case 'application/json':
                    const { title, description } = req.body;

                    const task = ({
                        id: randomUUID(),
                        title,
                        description,
                        completed_at: null,
                        created_at: new Date(),
                        updated_at: null
                    });

                    database.insert('tasks', task);

                    return res.writeHead(201).end();
                case 'multipart/form-data':
                    // Exemplo: https://efficient-sloth-d85.notion.site/Cria-o-via-CSV-com-Stream-21ba6d279991473792787d9265212181gi
                    // Exempo: https://github.com/rocketseat-education/ignite-nodejs-01-fundamentos-nodejs/blob/main/streams/stream-http-server.js
                    // Ler via transformação

                    for await (const chunk of req) {
                        // Process each chunk
                        console.log(chunk);
                    }

                    return res.writeHead(201).end();
                default:
                    return res.writeHead(400, { 'Content-Type': 'application/json' })
                              .end(JSON.stringify({ error: 'Unsupported content type' }));
            }
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select('tasks', search ? { title: decodeURIComponent(search), description: decodeURIComponent(search) } : null);

            return res.end(JSON.stringify(tasks));
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            const data = { updated_at: new Date() };

            if (title) data.title = title;
            if (description) data.description = description;

            database.update('tasks', id, data);

            return res.writeHead(204).end();
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            database.delete('tasks', id);

            return res.writeHead(204).end();
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.get('tasks', id);

            if (task) {
                const completed_at = task.completed_at ? null : new Date();
                database.update('tasks', id, { completed_at });
            
                return res.writeHead(204).end();
            } else {
                return res.writeHead(404).end();
            }
        }
    }
];