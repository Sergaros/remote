class Tree {
    constructor() {
        this.columns = [];
        this.state = [];
        this.current = null;
        this.path = [];
    }

    add(column){
        this.columns.push(column);
    }

    delete(number){
        this.columns.splice(number+1);
        this.state.splice(number+1);
    }

    open(number, id){
        this.state[number] = id;
        this.path.splice(number);
        this.setActive(id);
    }

    setActive(id){
        this.columns.forEach(column=>{
            let item = column.items.find(item=>item._id===id);
            if(item){
                column.items.forEach(item=>item.active = false);

                this.path.push(item.name);
                item.active = true;
                this.current = item;
            }
        });
    }
};
