module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id,
      from: "0xe070b23860fa281252ac4abb8d3e120f088d1fb1"

    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: 3, // Match any network id,
      from: "0xe070b23860fa281252ac4abb8d3e120f088d1fb1"
    }
  }
};
