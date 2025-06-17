import  mongoDbClient from '../config/mongodb.config.js';
import { getTimestamp } from '../helpers/index.js';

class Db {
  constructor(collection) {
    this.collection = collection;
    this.collectionInstance = null;
  }

  async attachCollectionInstance() {
    if (this.collectionInstance === null) {
      this.collectionInstance = await mongoDbClient.getCollection(
        this.collection,
      );
    }
  }

  async insertOne(data) {
    await this.attachCollectionInstance();
    const unixTimestamp = getTimestamp();
    const insertData = {
      ...data,
      createdAt: data.createdAt || unixTimestamp,
      updatedAt: data.updatedAt || unixTimestamp,
    };
    const { insertedId } = await this.collectionInstance.insertOne(insertData);
    return { insertedId, insertData };
  }

  async insertMany(data) {
    await this.attachCollectionInstance();
    const { insertedIds } = await this.collectionInstance.insertMany(data);
    return insertedIds;
  }

  async findOne(filter, projection = {}) {
    await this.attachCollectionInstance();
    const result = await this.collectionInstance.findOne(filter, {
      projection,
    });
    if (result === null) return null;
    return result;
  }

  async find(filter, options = {}) {
    await this.attachCollectionInstance();
    const projection = options.projection || {};
    const sort = options.sort || { createdAt: 1 };
    const skip = options.skip || 0;
    const limit = options.limit || 50;
    const totalDocs = await this.collectionInstance.countDocuments(filter);
    const result = await this.collectionInstance
      .find(filter)
      .project(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    const data = result;
    const currentPage = skip / limit + 1;
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      data,
      totalDocs,
      skip,
      limit,
      currentPage,
      totalPages,
      hasNextPage: limit * currentPage < totalDocs,
    };
  }

  async updateOne(filter, updateObject, arrayFilters = null) {
    await this.attachCollectionInstance();
    const unixTimestamp = getTimestamp();
    updateObject.$set = updateObject.$set || { updatedAt: unixTimestamp };
    updateObject.$set.updatedAt = updateObject.$set.updatedAt || unixTimestamp;
    const options = {
      upsert: false,
      returnDocument: 'after',
    };
    if (Array.isArray(arrayFilters)) {
      options.arrayFilters = arrayFilters;
    }
    const result = await this.collectionInstance.findOneAndUpdate(
      filter,
      { ...updateObject },
      options,
    );
    return result;
  }

  async updateMany(filter, updateObject) {
    await this.attachCollectionInstance();
    const unixTimestamp = getTimestamp();
    updateObject.$set = updateObject.$set || { updatedAt: unixTimestamp };
    updateObject.$set.updatedAt = updateObject.$set.updatedAt || unixTimestamp;
    const result = await this.collectionInstance.updateMany(
      filter,
      {
        ...updateObject,
      },
      {
        upsert: false,
        returnDocument: 'after',
      },
    );
    return result;
  }

  async aggregate(pipeline, options = {}) {
    await this.attachCollectionInstance();
    const result = await this.collectionInstance.aggregate(pipeline, options).toArray();
    return result;
  }

  async deleteOne(filter) {
    await this.attachCollectionInstance();
    const result = await this.collectionInstance.findOneAndDelete(filter);
    return result;
  }

  async deleteMany(filter) {
    await this.attachCollectionInstance();
    const result = await this.collectionInstance.deleteMany(filter);
    return result;
  }

  async count(filter) {
    await this.attachCollectionInstance();
    return this.collectionInstance.countDocuments(filter);
  }
}

export default Db;