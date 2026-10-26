// Visual renderer v2. Gameplay simulation stays in game.js: visual-only upgrade.
import { drawStage } from './visuals/stages.js';
import { drawFighter, portrait } from './visuals/characters.js';
import { drawHUD, drawAbilities, drawHitParticles, drawProjectiles, drawRoundBanner, drawImpactFlash } from './visuals/combat.js';
export { drawFighter, portrait };

export function render(ctx,game,time){
  if(!ctx||!game)return;
  const t=Number.isFinite(time)?time:0;
  ctx.clearRect(0,0,960,540);
  ctx.save();
  if(game.shake>0)ctx.translate(Math.sin(t*74)*game.shake*.72,Math.cos(t*96)*game.shake*.33);
  drawStage(ctx,t,game.stageIndex||0);
  for(const fighter of game.fighters){
    drawFighter(ctx,fighter,fighter.x,fighter.y,1.1,fighter.dir,t);
  }
  drawAbilities(ctx,game,t);
  drawProjectiles(ctx,game,t);
  drawHitParticles(ctx,game);
  drawImpactFlash(ctx,game);
  ctx.restore();
  drawHUD(ctx,game);
  drawRoundBanner(ctx,game);
}
