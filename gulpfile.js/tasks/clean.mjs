import * as del from 'del';
import { base as config } from '../config/index.mjs';

const cleanResources = () => {
  return del.deleteAsync(config.cleanDirectory);
};

const cleanResourcesWithoutImage = () => {
  return del.deleteAsync(config.cleanDirectoryWithoutImage);
};

export {
  cleanResources,
  cleanResourcesWithoutImage
};
