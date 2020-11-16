//partial credits to DeltaNedas
const ToStrI = {
  _(builder, res, cont) {
    this.res = builder.var(res);
    this.cont = builder.var(cont);
  },

  run(vm) {
    var h = vm.obj(this.cont);
    vm.setobj(this.res, (typeof h.toString) == "function" ? h.toString() : h + "");
  }
};

const ToStrStatement = {
  new: words => {
    const st = extend(LStatement, Object.create(ToStrStatement));
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

    const inst = extend(LExecutor.LInstruction, Object.create(ToStrI));
    inst._(h, this.res, this.cont);
    return inst;
  },

  buildt(table) {
    //todo dropdown
    table.clearChildren();//this just sounds horrible

    this.field(table, this.res, text => {this.res = text}).width(90);
    table.add(" = ");
    this.fields(table, "toString", this.cont, text => {this.cont = text});
  },

  write(builder) {
    builder.append("tostring " + this.res + "");
    builder.append(" ");
    builder.append(this.cont + "");
  },

  name: () => "To String",
  color: () => Pal.logicOperations
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("tostring", func(ToStrStatement.new));

LogicIO.allStatements.add(prov(() => ToStrStatement.new([
  "tostring",
  "result",
  ""
])));
