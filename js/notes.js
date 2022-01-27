function Note(title="", content="", labels=[]){

    this.id = String(Math.floor(Math.random()*1000)) + String(new Date().getTime()) + String(Math.floor(Math.random() * 500));
    this.title = title;
    this.content = content;
    this.labels = labels;
    this.isTrash = false;
    this.isArchive = false;

    function remove(){
        // code
    };

    this.save = () => {};
    this.trash = () => {};
    this.archive = () => {};
    this.unarchive = () => {};
    this.untrash = () => {};
}