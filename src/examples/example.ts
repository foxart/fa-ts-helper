class ExampleClass {
  public constructor(value: unknown) {
    this._testSync = value;
  }

  private _testSync: unknown;
  public get testSync(): unknown {
    return this._testSync;
  }

  public set testSync(value: string) {
    // console.log(`Setting value via: ${this.setTestSync.prototype}`);
    this._testSync = value;
  }

  public set setTestSync(value: string) {
    console.log(`Called setter: setTestSync with value ${value}`);
    this.testSync = value; // Here you're actually setting the value using the setter method defined above
  }
}

const example = new ExampleClass('Initial Value');
example.setTestSync = 'New Value';
