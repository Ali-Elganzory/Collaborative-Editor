import { Model, DataTypes } from 'sequelize';

import sequelize from './db_connection';

class DocumentModel extends Model {
    declare id: BigInt;
    declare title: string;
    declare content: string;
}

DocumentModel.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
},
    {
        sequelize,
    },
);

export default DocumentModel;