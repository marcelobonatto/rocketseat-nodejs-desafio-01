import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, 'utf-8')
            .then(data => {
                this.#database = JSON.parse(data);
            })
            .catch(() => {
                this.#persist();
            });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    indexOf(table, id) {
        return this.#database[table]?.findIndex(row => row.id === id) ?? -1;
    }

    get(table, id) {
        const rowIndex = this.indexOf(table, id);
        return rowIndex > -1 ? this.#database[table][rowIndex] : null;
    }

    select(table, search) {
        let data = this.#database[table] ?? [];

        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                });
            });
        }

        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data;
    }

    update(table, id, data) {
        const rowIndex = this.indexOf(table, id);

        if (rowIndex > -1) {
            for (const key in data) {
                this.#database[table][rowIndex][key] = data[key];
            }

            this.#persist();
        }
    }

    delete(table, id) {
        const rowIndex = this.indexOf(table, id);

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }
}