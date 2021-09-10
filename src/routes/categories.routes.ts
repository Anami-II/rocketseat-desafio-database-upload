import { Router } from 'express';
import { getRepository } from 'typeorm';

import Category from '../models/Category';
import CreateCategoryService from '../services/CreateCategoryService';

const categoriesRouter = Router();

categoriesRouter.post('/', async (request, response) => {
  const { title } = request.body;

  const createCategory = new CreateCategoryService();

  const category = await createCategory.execute({
    title,
  });

  return response.status(201).json(category);
});

categoriesRouter.get('/', async (request, response) => {
  const categoriesRepository = getRepository<Category>(Category);
  const categories = await categoriesRepository.find();
  return response.status(200).json(categories);
});

export default categoriesRouter;
