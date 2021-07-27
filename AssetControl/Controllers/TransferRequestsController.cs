using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssetControl.Data;
using AssetControl.api.Models;

namespace AssetControl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransferRequestsController : ControllerBase
    {
        private readonly AssetControlContext _context;

        public TransferRequestsController(AssetControlContext context)
        {
            _context = context;
        }

        // GET: api/TransferRequests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransferRequest>>> GetTransferRequest()
        {
            return await _context.TransferRequest.ToListAsync();
        }

        // GET: api/TransferRequests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransferRequest>> GetTransferRequest(int id)
        {
            var transferRequest = await _context.TransferRequest.FindAsync(id);

            if (transferRequest == null)
            {
                return NotFound();
            }

            return transferRequest;
        }

        // PUT: api/TransferRequests/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransferRequest(int id, TransferRequest transferRequest)
        {
            if (id != transferRequest.Id)
            {
                return BadRequest();
            }

            _context.Entry(transferRequest).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransferRequestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TransferRequests
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TransferRequest>> PostTransferRequest(TransferRequest transferRequest)
        {
            _context.TransferRequest.Add(transferRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTransferRequest", new { id = transferRequest.Id }, transferRequest);
        }

        // DELETE: api/TransferRequests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransferRequest(int id)
        {
            var transferRequest = await _context.TransferRequest.FindAsync(id);
            if (transferRequest == null)
            {
                return NotFound();
            }

            _context.TransferRequest.Remove(transferRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransferRequestExists(int id)
        {
            return _context.TransferRequest.Any(e => e.Id == id);
        }
    }
}
