import { ClassConstructor, ClassTransformOptions, instanceToPlain, plainToInstance } from 'class-transformer';

export class TransformerClass {
  public constructor(private readonly config: ClassTransformOptions) {}

  public getConfig(): ClassTransformOptions {
    return this.config;
  }

  public instanceToPlain<I>(instance: I): I {
    return instanceToPlain(instance, this.config) as I;
  }

  public plainToInstance<P, I>(plain: P, classConstructor: ClassConstructor<I>): I {
    return plainToInstance(classConstructor, plain, this.config);
  }
}
