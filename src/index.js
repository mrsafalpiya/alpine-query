export default function (Alpine) {
  Alpine.directive(
    "query",
    (_, { value, expression }, { Alpine, evaluate }) => {
      const options = evaluate(expression);
      Alpine.store("query-" + value, {
        fn: options.fn || null,
        runOnMount: options.runOnMount || false,

        // state
        executeCount: 0,
        status: "stall",
        data: null,

        // callbacks
        onSuccess: options.onSuccess || null,
        onFailure: options.onFailure || null,
        onSettled: options.onSettled || null,

        init() {
          if (this.runOnMount) {
            this.execute();
          }
        },

        async execute() {
          this.executeCount++;
          this.status =
            this.executeCount == 1 ? "executing-first" : "executing";

          try {
            this.data = await this.fn();
            this.status = "success";
            if (this.onSuccess) {
              await this.onSuccess(this.data);
            }
          } catch {
            this.status = "failure";
            if (this.onFailure) {
              await this.onFailure(this.data);
            }
          }

          if (this.onSettled) {
            await this.onSettled(this.status, this.data);
          }
        },
      });
    }
  );
}
