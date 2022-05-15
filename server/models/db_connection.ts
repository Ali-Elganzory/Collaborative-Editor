import { Sequelize } from 'sequelize';

const sequelize: Sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

export default sequelize;