//partial credits to DeltaNedas
const UselessI = {
  _(builder, res, cont) {
    this.res = builder.var(res);
    this.cont = builder.var(cont);
  },

  run(vm) {
    //vm.setobj(this.res, vm.obj(this.cont) + "");
  }
};

const UselessStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(UselessStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.res = words[1];
    this.cont = words[2];
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(UselessI));
    inst._(h, this.res, this.cont);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible

    //this.field(table, this.res, text => {this.res = text}).width(90);
    table.add("???");
    //this.fields(table, "?", this.cont, text => {this.cont = text});
  },

  write(builder) {
    builder.append("owo " + this.res + "");
    builder.append(" ");
    builder.append(this.cont + "");
  },

  name: () => "Rainbow!",
  color: () => Tmp.c1.set(1, 1, 1, 1).fromHsv((Time.time() * 3)%360, 1, 1)
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("owo", func(UselessStatement.new));

LogicIO.allStatements.add(prov(() => UselessStatement.new([
  "owo",
  "",
  ""
])));
