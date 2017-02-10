angular
.module('incremental')
.controller('IncCtrl',
['$scope',
'$document',
'$interval',
'$sce',
'$filter',
'$timeout',
'util',
'savegame',
'player',
'generator',
'upgrade',
'script',
'enemy',
'generatorEnemy',
'upgradeEnemy',
'scriptEnemy',
function ($scope, $document, $interval, $sce, $filter, $timeout, util, savegame, player, generator, upgrade, script, enemy, generatorEnemy, upgradeEnemy, scriptEnemy) {
  $scope.version = '0.2.2';
  $scope.Math = window.Math;
  
  $scope.util = util;
  $scope.savegame = savegame;
  $scope.player = player;
  $scope.generator = generator;
  $scope.upgrade = upgrade;
  $scope.script = script;
  $scope.enemy = enemy;
  $scope.generatorEnemy = generatorEnemy;
  $scope.upgradeEnemy = upgradeEnemy;
  var self = this;
  
  $scope.current_tab = "Game";
  $scope.turn = 0;
  $scope.goal = 1e9;
  $scope.error_msg = "";

  var player_script = "generator.buyGenerators('Tier 1',1);";
  var enemy_script = "generator.buyGenerators('Tier 1',1);\
  upgrade.buyUpgrade('Tier 1-1');";
  
  player.setScope($scope);
  enemy.setScope($scope);
  util.setScope($scope);
  savegame.setScope($scope);

  $scope.tierProduction = function (actor, generator, upgrade, name) {
	if(!actor.data) return;
    var baseProduction = generator.getGenerators()[name].power *
                         actor.data.generators[name].level;
    return $scope.upgradedProduction(actor, generator, upgrade, baseProduction, name);
  };
  
  $scope.totalProduction = function (actor, generator, upgrade) {
    var total = 0;
    for(var tier in generator.getGenerators()) {
      total += this.tierProduction(actor, generator, upgrade, tier);
    }
    return total;
  };
  
  $scope.upgradedProduction = function (actor, generator, upgrade, production, name) {
	if(!actor.data) return;
	var generators = generator.getGenerators();
	var upgrades = upgrade.getUpgrades();
    for(var upgrade in generators[name].upgrades) {
        if(actor.data.upgrades[generators[name].upgrades[upgrade]].bought) {
          power = upgrades[generators[name].upgrades[upgrade]].power;
          production = production * power;
        }
      }
      return production;
  };
  
  self.processProduction = function () {
	player.data.power += $scope.totalProduction(player, generator, upgrade);
	enemy.data.power += $scope.totalProduction(enemy, generatorEnemy, upgradeEnemy);
  };  
  
  self.update = function () {
    self.processProduction();
	$scope.error_msg = script.eval();
	scriptEnemy.eval();
	$scope.turn++;
  };

  self.init = function () {
    $scope.current_tab = "Game";
    player.populatePlayer();
	player.data.script = player_script;
    enemy.populatePlayer();
	enemy.data.script = enemy_script;
	scriptEnemy.script = enemy_script;
  };

  self.startup = function () {
    self.init();
	savegame.load();
    $interval(self.update, 1);
    $interval(savegame.save, 10000);
  };
  
  self.onload = $timeout(self.startup);  
}]);
