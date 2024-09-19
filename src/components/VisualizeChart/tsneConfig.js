function TsneConfig() {
    this.perplexity = 30.0;
    this.learning_rate = 150.0;
    this.theta = 0.5;
    // It is recommended to use number of neighbors
    // as 3 times the perplexity
    this.number_of_neighbors = 3.0 * this.perplexity;

    // Other parameters include:
    //
    // this.momentum = 0.5;
    // this.final_momentum = 0.8;
    // this.momentum_switch_epoch = 250;
    // this.stop_lying_epoch = 250;
    // this.embedding_dim = 2;
}

export const tsneConfig = new TsneConfig();